<?php
declare(strict_types=1);
// SOURIREPLUS_TWO_SCREEN_V1 — encrypted sessions; private directory denied by Apache.
const SP_VERSION = '0.4.4';
const SP_CRITERIA = ['caries'=>'Caries','restaurations'=>'Restaurations','gencives'=>'Gencives','alignement'=>'Alignement','fonction'=>'Fonction','esthetique'=>'Esthétique'];
const SP_BASE = 'https://sourireplus.ch/methode/visite/';

final class SpError extends RuntimeException {
    public int $status;
    public function __construct(int $status, string $message) { parent::__construct($message); $this->status=$status; }
}
function sp_assert(bool $ok, int $status, string $message): void { if (!$ok) throw new SpError($status,$message); }
function sp_dir(): string { return getenv('SOURIREPLUS_METHOD_PRIVATE') ?: dirname(__DIR__,2).'/.sourireplus-methode'; }
function sp_config(): array {
    static $config=null;
    if ($config!==null) return $config;
    $path=sp_dir().'/config.php';
    sp_assert(is_file($path),503,'Le service de séances est en cours de configuration.');
    $guard="<?php http_response_code(404); exit; __halt_compiler();\n";
    $raw=file_get_contents($path);
    sp_assert(str_starts_with($raw,$guard),503,'Configuration protégée indisponible.');
    $config=json_decode(substr($raw,strlen($guard)),true,32,JSON_THROW_ON_ERROR);
    sp_assert(isset($config['key'],$config['access_hash']) && strlen(base64_decode($config['key'],true) ?: '')===32,503,'Configuration du service indisponible.');
    return $config;
}
function sp_key(): string { return base64_decode(sp_config()['key'],true); }
function sp_token(): string { return rtrim(strtr(base64_encode(random_bytes(32)),'+/','-_'),'='); }
function sp_text($value, int $max, bool $required=true): string {
    sp_assert(is_string($value) && strlen($value)<=$max && preg_match('//u',$value)===1,400,'Champ de texte invalide.');
    sp_assert(!preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/',$value),400,'Caractère de contrôle interdit.');
    $value=trim($value); sp_assert(!$required || $value!=='',400,'Veuillez compléter les champs nécessaires.'); return $value;
}
function sp_seal(array $value,string $context): string {
    $iv=random_bytes(12); $tag='';
    $cipher=openssl_encrypt(json_encode($value,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),'aes-256-gcm',sp_key(),OPENSSL_RAW_DATA,$iv,$tag,$context);
    sp_assert($cipher!==false,500,'Enregistrement impossible.');
    return json_encode(['iv'=>base64_encode($iv),'tag'=>base64_encode($tag),'data'=>base64_encode($cipher)],JSON_THROW_ON_ERROR);
}
function sp_unseal(string $raw,string $context): array {
    $box=json_decode($raw,true,16,JSON_THROW_ON_ERROR);
    $plain=openssl_decrypt(base64_decode($box['data'],true),'aes-256-gcm',sp_key(),OPENSSL_RAW_DATA,base64_decode($box['iv'],true),base64_decode($box['tag'],true),$context);
    sp_assert($plain!==false,500,'Lecture de la séance impossible.');
    return json_decode($plain,true,64,JSON_THROW_ON_ERROR);
}
function sp_atomic(string $path,string $raw): void {
    $temp=$path.'.'.bin2hex(random_bytes(8)).'.tmp';
    try {
        $file=fopen($temp,'xb'); sp_assert($file!==false,500,'Enregistrement impossible.');
        chmod($temp,0600);
        try { sp_assert(fwrite($file,$raw)===strlen($raw) && fflush($file),500,'Enregistrement incomplet.'); if(function_exists('fsync')) fsync($file); } finally { fclose($file); }
        sp_assert(rename($temp,$path),500,'Enregistrement impossible.');
    } finally { if(is_file($temp)) unlink($temp); }
}
function sp_locked(string $name,callable $action) {
    sp_assert(preg_match('/\A[a-z0-9_-]{1,80}\z/',$name)===1,400,'Identifiant invalide.');
    $path=sp_dir().'/'.$name.'.lock'; $handle=fopen($path,'c');
    sp_assert($handle!==false,503,'Service de séances indisponible.'); chmod($path,0600);
    try { sp_assert(flock($handle,LOCK_EX),503,'Séance occupée, veuillez réessayer.'); return $action(); }
    finally { flock($handle,LOCK_UN); fclose($handle); }
}
function sp_session(string $id,callable $action) {
    sp_assert(preg_match('/\A[a-f0-9]{32}\z/',$id)===1,400,'Identifiant de séance invalide.');
    return sp_locked($id,function()use($id,$action) {
        $path=sp_dir().'/'.$id.'.enc'; sp_assert(is_file($path),404,'Séance introuvable.');
        $session=sp_unseal(file_get_contents($path),$id); $before=$session;
        $result=$action($session);
        if($session!==$before) { $session['updated_at']=gmdate('c'); sp_atomic($path,sp_seal($session,$id)); }
        return $result;
    });
}
function sp_header_token(): string { return $_SERVER['HTTP_X_SOURIREPLUS_TOKEN'] ?? ''; }
function sp_is_staff(): bool {
    $token=sp_header_token();
    if(strlen($token)===43 && hash_equals(sp_config()['access_hash'],hash('sha256',$token))) return true;
    $cookie=$_COOKIE['sp_method_staff'] ?? '';
    if(!is_string($cookie) || strlen($cookie)>300) return false;
    $parts=explode('.',$cookie); if(count($parts)!==3 || !ctype_digit($parts[0])) return false;
    return (int)$parts[0]>=time() && hash_equals(hash_hmac('sha256',$parts[0].'.'.$parts[1],sp_key()),$parts[2]);
}
function sp_staff(): void { sp_assert(sp_is_staff(),401,'Accès équipe requis.'); }
function sp_create_access(): void {
    if(sp_is_staff()) return;
    $token=sp_header_token();
    sp_assert(strlen($token)===43 && isset(sp_config()['bridge_hash']) && hash_equals(sp_config()['bridge_hash'],hash('sha256',$token)),401,'Accès passerelle requis.');
}
function sp_role(array $s): string {
    $candidate=sp_header_token(); sp_assert(strlen($candidate)===43,401,'Lien de séance invalide.');
    sp_assert($s['access_until']>=time(),401,'Le lien a expiré. Rouvrez la séance depuis l’espace équipe.');
    foreach($s['tokens'] as $role=>$token) if(hash_equals($token,$candidate)) return $role;
    throw new SpError(401,'Lien de séance invalide.');
}
function sp_links(array $s): array {
    $base=getenv('SOURIREPLUS_METHOD_TEST_BASE') ?: SP_BASE; $out=[];
    foreach($s['tokens'] as $role=>$token) $out[$role]=$base.'#'.http_build_query(['session'=>$s['id'],'role'=>$role,'token'=>$token]);
    return $out;
}
function sp_active_stages(array $plan): array { return array_values(array_filter(['essential','needs','strategy'],fn($key)=>trim($plan[$key]??'')!=='')); }
function sp_ready(array $s): bool { return count($s['revealed'])===6 && count(sp_active_stages($s['plan']))>0; }
function sp_objectives($input): array {
    sp_assert(is_array($input),400,'Objectifs invalides.');
    sp_assert(!array_diff(array_keys($input),['essential','needs','strategy']),400,'Devis inconnu.');
    $out=[];
    foreach(['essential','needs','strategy'] as $stage) {
        $row=$input[$stage]??[];
        sp_assert(is_array($row)&&!array_diff(array_keys($row),array_keys(SP_CRITERIA)),400,'Critère d’objectif invalide.');
        foreach(SP_CRITERIA as $id=>$label) {
            $value=$row[$id]??null;
            sp_assert($value===null||(is_int($value)&&$value>=1&&$value<=10),400,'Un objectif doit être une note entière de 1 à 10, ou rester vide.');
            $out[$stage][$id]=$value;
        }
    }
    return $out;
}
function sp_evolution(array $s): array {
    $objectives=$s['plan']['objectives']??[];
    $values=$s['scores']['clinical']; $stages=[]; $active=sp_active_stages($s['plan']);
    foreach(['essential','needs','strategy'] as $stage) {
        $included=in_array($stage,$active,true);
        if($included) foreach(SP_CRITERIA as $id=>$label) if(isset($objectives[$stage][$id]))$values[$id]=$objectives[$stage][$id];
        // Keep stage keys for clients opened before 0.4.2; new clients render active_stages only.
        $stages[$stage]=['scores'=>$values,'mean'=>array_sum($values)/6,'active'=>$included];
    }
    return ['patient_mean'=>array_sum($s['scores']['patient'])/6,'clinical_mean'=>array_sum($s['scores']['clinical'])/6,'stages'=>$stages,'active_stages'=>$active];
}
function sp_state(array $s,string $role): array {
    $visible=[]; $filled=[];
    foreach($s['scores'] as $side=>$scores) foreach($scores as $id=>$value) {
        $owns=($side==='patient'&&$role==='presentation')||($side==='clinical'&&$role==='practitioner');
        $visible[$side][$id]=(($owns&&!$s['locked'][$side])||in_array($id,$s['revealed'],true))?$value:null;
        $filled[$side][$id]=$value!==null;
    }
    $patient=['name'=>$s['patient']['name']];
    if($role==='practitioner') $patient=$s['patient'];
    $out=['mode'=>'HOSTED','role'=>$role,'session_id'=>$s['id'],'dossier'=>$s['patient']['display_id']?:$s['patient']['patient_id'],
        'patient'=>$patient,'created_at'=>$s['created_at'],'updated_at'=>$s['updated_at'],'revision'=>$s['revision'],
        'criteria'=>array_map(fn($id,$label)=>['id'=>$id,'label'=>$label],array_keys(SP_CRITERIA),array_values(SP_CRITERIA)),
        'scores'=>$visible,'filled'=>$filled,'locked'=>$s['locked'],'revealed'=>$s['revealed'],
        'phase'=>!$s['locked']['patient']?'patient':(!$s['locked']['clinical']?'clinical':(count($s['revealed'])<6?'reveal':'plan')),
        'target_age'=>(int)($s['plan']['horizon']??70),'summary_ready'=>sp_ready($s),'report_available'=>false,'closed'=>$s['closed']];
    if($s['patient']['birth_date']!=='') {
        $born=new DateTimeImmutable($s['patient']['birth_date']);
        $visit=(new DateTimeImmutable($s['created_at']))->setTimezone(new DateTimeZone('Europe/Zurich'));
        $out['patient_age']=$born->diff($visit)->y;
    }
    if(sp_ready($s)) $out['evolution']=sp_evolution($s);
    if($role==='practitioner') { $out['plan']=$s['plan']; $out['plan']['objectives']=$s['plan']['objectives']??sp_objectives([]); $out['links']=['presentation'=>sp_links($s)['presentation']]; $out['plan_revision']=$s['plan_revision']; }
    return $out;
}
function sp_patient(array $data): array {
    $p=[]; foreach(['patient_id'=>128,'display_id'=>128,'first_name'=>256,'last_name'=>256,'practice_number'=>128,'source_pvs'=>128] as $key=>$max)
        $p[$key]=sp_text($data[$key]??'', $max, in_array($key,['patient_id','last_name','practice_number','source_pvs'],true));
    $p['birth_date']=sp_text($data['birth_date']??'',10,false);
    if($p['birth_date']!=='') { $d=DateTimeImmutable::createFromFormat('!Y-m-d',$p['birth_date']); sp_assert($d!==false&&$d->format('Y-m-d')===$p['birth_date']&&$d<=new DateTimeImmutable('today')&&$d>=new DateTimeImmutable('1900-01-01'),400,'Date de naissance invalide.'); }
    $p['name']=trim($p['first_name'].' '.$p['last_name']);
    return $p;
}
function sp_create(array $data): array {
    $patient=sp_patient($data['patient']??[]);
    $reuse=($data['resume_today']??false)===true;
    $identity=hash_hmac('sha256',json_encode([$patient['source_pvs'],$patient['practice_number'],$patient['patient_id']],JSON_THROW_ON_ERROR),sp_key());
    return sp_locked('create',function()use($patient,$reuse,$identity) {
        if($reuse) foreach(glob(sp_dir().'/*.enc') as $file) {
            $id=basename($file,'.enc');
            $found=sp_session($id,function(&$s)use($patient,$identity) {
                if($s['identity']!==$identity||$s['closed']||substr($s['created_at'],0,10)!==gmdate('Y-m-d'))return null;
                // An identity conflict must never silently attach clinical notes to another person.
                sp_assert($s['patient']===$patient,409,'Identité différente pour ce dossier. Vérifiez la séance depuis l’espace équipe.');
                if($s['access_until']<time()) { $s['tokens']=['presentation'=>sp_token(),'practitioner'=>sp_token()]; $s['access_until']=time()+43200; }
                return ['session_id'=>$s['id'],'links'=>sp_links($s),'resumed'=>true];
            }); if($found!==null)return $found;
        }
        $id=bin2hex(random_bytes(16)); $empty=array_fill_keys(array_keys(SP_CRITERIA),null);
        $s=['id'=>$id,'identity'=>$identity,'patient'=>$patient,'tokens'=>['presentation'=>sp_token(),'practitioner'=>sp_token()],
            'access_until'=>time()+43200,'created_at'=>gmdate('c'),'updated_at'=>gmdate('c'),'closed'=>false,'revision'=>0,'plan_revision'=>0,
            'scores'=>['patient'=>$empty,'clinical'=>$empty],'locked'=>['patient'=>false,'clinical'=>false],'revealed'=>[],
            'plan'=>['essential'=>'','needs'=>'','strategy'=>'','horizon'=>70]];
        sp_atomic(sp_dir().'/'.$id.'.enc',sp_seal($s,$id));
        return ['session_id'=>$id,'links'=>sp_links($s),'resumed'=>false];
    });
}
function sp_mutate(array &$s,string $role,string $action,array $data): array {
    sp_assert(!$s['closed'],409,'Cette séance est terminée. Rouvrez-la depuis l’espace équipe.');
    if(in_array($action,['score','lock'],true)) {
        $side=$data['side']??'';
        sp_assert(($side==='patient'&&$role==='presentation')||($side==='clinical'&&$role==='practitioner'),403,'Cette action appartient à un autre écran.');
        sp_assert(!$s['locked'][$side],409,'Ces cartes sont déjà verrouillées.');
        sp_assert($side!=='clinical'||$s['locked']['patient'],409,'Le ressenti doit d’abord être verrouillé.');
        if($action==='score') {
            $id=$data['criterion']??''; $score=$data['score']??null;
            sp_assert(is_string($id)&&array_key_exists($id,SP_CRITERIA)&&is_int($score)&&$score>=0&&$score<=10,400,'Note invalide.');
            $s['scores'][$side][$id]=$score;
        } else { sp_assert(!in_array(null,$s['scores'][$side],true),409,'Les six notes sont nécessaires.'); $s['locked'][$side]=true; }
    } elseif($action==='reveal') {
        $id=$data['criterion']??''; sp_assert(is_string($id)&&array_key_exists($id,SP_CRITERIA),400,'Critère invalide.');
        sp_assert($s['locked']['patient']&&$s['locked']['clinical'],409,'Les deux séries doivent être verrouillées.');
        if(!in_array($id,$s['revealed'],true))$s['revealed'][]=$id;
    } elseif($action==='plan') {
        sp_assert($role==='practitioner',403,'Accès praticien requis.');
        sp_assert(count($s['revealed'])===6,409,'Découvrez les six paires avant de préparer les orientations.');
        sp_assert(($data['plan_revision']??null)===$s['plan_revision'],409,'Les orientations ont changé sur un autre écran. Rechargez la séance avant d’enregistrer.');
        $plan=[]; foreach(['essential','needs','strategy'] as $key)$plan[$key]=sp_text($data[$key]??'',20000,false);
        $h=$data['horizon']??null; sp_assert(is_int($h)&&$h>=55&&$h<=100,400,'Âge repère invalide.'); $plan['horizon']=$h;
        // Older open clients may omit this field: preserve already saved objectives.
        $plan['objectives']=array_key_exists('objectives',$data)?sp_objectives($data['objectives']):($s['plan']['objectives']??sp_objectives([]));
        foreach(['essential','needs','strategy'] as $stage) if($plan[$stage]==='')$plan['objectives'][$stage]=array_fill_keys(array_keys(SP_CRITERIA),null);
        $s['plan']=$plan; $s['plan_revision']++;
    } elseif($action==='summary') { sp_assert($role==='practitioner',403,'Accès praticien requis.'); sp_assert(sp_ready($s),409,'Complétez et enregistrez au moins un devis.'); }
    elseif($action==='close') { sp_assert($role==='practitioner',403,'Accès praticien requis.'); $s['closed']=true; }
    else throw new SpError(404,'Action introuvable.');
    $s['revision']++; $s['updated_at']=gmdate('c');
    return sp_state($s,$role);
}
