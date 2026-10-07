<?php
declare(strict_types=1);
// Registered by 3Shape on 2026-10-06. Never use the mismatched hyperlink from
// the example email. Public-client Authorization Code + fresh PKCE S256.
const SP3_CLIENT = 'SourirePlus.UPIP.PMS.Production.EU';
const SP3_REDIRECT = 'https://sourireplus.ch/methode/api/3shape/oauth/callback';
const SP3_AUTHORIZE = 'https://identity.3shape.com/connect/authorize';
const SP3_TOKEN = 'https://identity.3shape.com/connect/token';
const SP3_SCOPES = 'openid api profile api.workflow.init api.media.read api.media.download api.cases.read license.read offline_access';

function sp3_dir(): string {
    $dir=sp_dir().'/integrations/3shape';
    if(!is_dir($dir)) sp_assert(mkdir($dir,0700,true),503,'Stockage de connexion indisponible.');
    return $dir;
}
function sp3_read(string $name): ?array {
    $path=sp3_dir().'/'.$name.'.enc';
    if(!is_file($path)) return null;
    sp_assert(filesize($path)<=($name==='bridge-state'?4194304:(str_starts_with($name,'job-')?1048576:65536)),503,'Stockage de connexion invalide.');
    return sp_unseal(file_get_contents($path),'3shape-'.$name);
}
function sp3_write(string $name,array $value): void {
    sp_atomic(sp3_dir().'/'.$name.'.enc',sp_seal($value,'3shape-'.$name));
}
function sp3_start(): array {
    return sp_locked('3shape_oauth',function() {
        $state=sp_token(); $verifier=sp_token(); $binding=sp_token();
        sp3_write('pending',['state_hash'=>hash('sha256',$state),'verifier'=>$verifier,
            'binding_hash'=>hash('sha256',$binding),'expires_at'=>time()+600]);
        $challenge=rtrim(strtr(base64_encode(hash('sha256',$verifier,true)),'+/','-_'),'=');
        return ['authorization_url'=>SP3_AUTHORIZE.'?'.http_build_query([
            'client_id'=>SP3_CLIENT,'response_type'=>'code','scope'=>SP3_SCOPES,
            'redirect_uri'=>SP3_REDIRECT,'code_challenge'=>$challenge,
            'code_challenge_method'=>'S256','response_mode'=>'query','state'=>$state], '', '&', PHP_QUERY_RFC3986),
            'binding'=>$binding];
    });
}
function sp3_http(array $form): array {
    // Fixed endpoint, TLS verification and no redirects: tokens cannot be sent
    // to a caller-selected host. Returned provider error text is never echoed.
    $context=stream_context_create(['http'=>['method'=>'POST','timeout'=>15,
        'ignore_errors'=>true,'follow_location'=>0,'max_redirects'=>0,
        'header'=>"Content-Type: application/x-www-form-urlencoded\r\nAccept: application/json\r\n",
        'content'=>http_build_query($form,'','&',PHP_QUERY_RFC3986)],
        'ssl'=>['verify_peer'=>true,'verify_peer_name'=>true,'allow_self_signed'=>false]]);
    $body=@file_get_contents(SP3_TOKEN,false,$context,0,65537);
    $status=0; $json=false;
    foreach($http_response_header??[] as $line) {
        if(preg_match('~^HTTP/\S+ (\d{3})~',$line,$m)) $status=(int)$m[1];
        if(preg_match('~^Content-Type:\s*application/json(?:\s*;|\s*$)~i',$line))$json=true;
    }
    sp_assert($status===200&&$json&&is_string($body)&&strlen($body)<=65536,502,'Connexion 3Shape indisponible. Réessayez depuis l’espace équipe.');
    try { $result=json_decode($body,true,16,JSON_THROW_ON_ERROR); }
    catch(Throwable $e) { throw new SpError(502,'Réponse 3Shape invalide.'); }
    sp_assert(is_array($result),502,'Réponse 3Shape invalide.'); return $result;
}
function sp3_tokens(array $result,?array $previous=null): array {
    sp_assert(isset($result['access_token'],$result['token_type'],$result['expires_in'])
        &&is_string($result['access_token'])&&strlen($result['access_token'])>0&&strlen($result['access_token'])<32768
        &&is_string($result['token_type'])&&strcasecmp($result['token_type'],'Bearer')===0
        &&is_int($result['expires_in'])&&$result['expires_in']>0&&$result['expires_in']<=604800,502,'Autorisation 3Shape invalide.');
    $refresh=$result['refresh_token']??($previous['refresh_token']??null);
    sp_assert(is_string($refresh)&&strlen($refresh)>0&&strlen($refresh)<32768,502,'Autorisation durable 3Shape manquante. Reconnectez le compte.');
    $scope=$result['scope']??($previous['scope']??SP3_SCOPES);
    sp_assert(is_string($scope)&&strlen($scope)<2000,502,'Portées 3Shape invalides.');
    foreach(['api.workflow.init','api.media.read','api.media.download','api.cases.read'] as $required)
        sp_assert(in_array($required,explode(' ',$scope),true),502,'Les droits 3Shape demandés ne sont pas tous accordés.');
    return ['access_token'=>$result['access_token'],'refresh_token'=>$refresh,'scope'=>$scope,
        'expires_at'=>time()+$result['expires_in'],'authorized_at'=>$previous['authorized_at']??gmdate('c'),
        'company_verified'=>false,'clinical_ready'=>false];
}
function sp3_finish(array $query,string $binding,?callable $transport=null): void {
    sp_locked('3shape_oauth',function()use($query,$binding,$transport) {
        $pending=sp3_read('pending'); $state=$query['state']??'';
        sp_assert(is_string($state)&&preg_match('/\A[A-Za-z0-9_-]{43}\z/',$state)===1
            &&preg_match('/\A[A-Za-z0-9_-]{43}\z/',$binding)===1&&$pending!==null
            &&$pending['expires_at']>=time()&&hash_equals($pending['state_hash'],hash('sha256',$state))
            &&hash_equals($pending['binding_hash'],hash('sha256',$binding)),400,'Cette connexion a expiré ou ne correspond pas à ce navigateur. Recommencez depuis l’espace équipe.');
        // Consume before the exchange: codes are one-time, including on a network
        // interruption. Existing valid credentials survive a failed new attempt.
        unlink(sp3_dir().'/pending.enc');
        sp_assert(!isset($query['error']),400,'L’autorisation 3Shape a été annulée.');
        $code=$query['code']??'';
        sp_assert(is_string($code)&&strlen($code)>0&&strlen($code)<=4096&&!preg_match('/[\x00-\x20\x7f]/',$code),400,'Code de connexion invalide.');
        $result=($transport??'sp3_http')(['grant_type'=>'authorization_code','client_id'=>SP3_CLIENT,
            'redirect_uri'=>SP3_REDIRECT,'code'=>$code,'code_verifier'=>$pending['verifier']]);
        sp3_write('tokens',sp3_tokens($result));
    });
}
function sp3_status(): array {
    $tokens=sp3_read('tokens');
    return ['authorization_saved'=>$tokens!==null,'expires_at'=>$tokens['expires_at']??null,
        'authorized_at'=>$tokens['authorized_at']??null,'company_verified'=>false,'clinical_ready'=>false,
        'next_step'=>$tokens?'Validation du compte, du poste Unite et des échanges Dx Plus requise.':'Relier le compte 3Shape de développement pour commencer les essais.'];
}
function sp3_access_token(?callable $transport=null): string {
    // Internal use only. There is deliberately no HTTP action returning tokens.
    return sp_locked('3shape_oauth',function()use($transport) {
        $tokens=sp3_read('tokens'); sp_assert($tokens!==null,401,'Connexion 3Shape requise.');
        if($tokens['expires_at']<=time()+60) {
            $result=($transport??'sp3_http')(['grant_type'=>'refresh_token','client_id'=>SP3_CLIENT,
                'refresh_token'=>$tokens['refresh_token']]);
            $tokens=sp3_tokens($result,$tokens);sp3_write('tokens',$tokens);
        }
        return $tokens['access_token'];
    });
}
function sp3_disconnect(): void {
    sp_locked('3shape_oauth',function() {
        foreach(['pending','tokens']as$name){$path=sp3_dir().'/'.$name.'.enc';if(is_file($path))unlink($path);}
    });
}
