<?php
declare(strict_types=1);
require_once __DIR__.'/3shape.php';
const SP3_PDF_LIMIT=15728640;
const SP3_ERROR_CODES=['authorization_required','permission_denied','patient_or_media_not_found','unite_initializing','unite_refused','unite_unavailable','request_uncertain','response_too_large','unsupported_encoding','invalid_response','invalid_pdf','pdf_size_mismatch','invalid_media_identifier','too_many_reports','host_not_on_local_network','invalid_vendor_certificate','worker_error'];
function sp3_uuid($s): bool { return is_string($s)&&preg_match('/\A[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\z/i',$s)===1; }
function sp3_company(string $token): string {
    // Token obtained directly from the fixed TLS-validated 3Shape token endpoint.
    // This extraction is for tenant binding, never acceptance of a user-supplied JWT.
    $parts=explode('.',$token);sp_assert(count($parts)===3,409,'Le jeton 3Shape ne permet pas de vérifier la société.');
    $claims=json_decode(base64_decode(strtr($parts[1],'-_','+/'),true)?:'',true);
    $ids=[];
    foreach(['companyId','company_id','CompanyId']as$key)if(isset($claims[$key]))$ids[]=$claims[$key];
    $ids=array_unique($ids,SORT_REGULAR);
    sp_assert(count($ids)===1&&is_string($ids[0])&&sp3_uuid($ids[0]),409,'La société du compte 3Shape doit être vérifiée.');
    return strtolower($ids[0]);
}
function sp3_bridge_state(): array { return sp3_read('bridge-state')??['devices'=>[],'jobs'=>[]]; }
function sp3_load_jobs(array &$state,?string $session=null,?string $device=null,?string $id=null): void {
    foreach($state['jobs']as$key=>&$job){
        if(($session!==null&&$job['session_id']!==$session)||($device!==null&&($job['device_id']!==$device||$job['status']!=='queued'))||($id!==null&&$key!==$id))continue;
        $record=sp3_read('job-'.$key);sp_assert($record!==null,503,'Historique de liaison indisponible.');
        // The durable job is written before the index. A crash between those
        // writes must never turn a claimed clinical request back into queued.
        // Index cancellation (including device revocation) always wins.
        $status=$job['status'];
        if($status!=='cancelled'&&$record['status']!=='queued')$status=$record['status'];
        $job=array_merge($record,$job);$job['status']=$status;
    }unset($job);
}
function sp3_save_bridge(array $state): void {
    $index=['devices'=>$state['devices'],'jobs'=>[]];
    foreach($state['jobs']as$id=>$job){
        if(isset($job['patient']))sp3_write('job-'.$id,$job);
        $index['jobs'][$id]=array_intersect_key($job,array_flip(['session_id','device_id','status','created_at']));
    }
    sp3_write('bridge-state',$index);
}
function sp3_device_auth(array $state): string {
    $key=$_SERVER['HTTP_X_SOURIREPLUS_DEVICE']??'';
    sp_assert(is_string($key)&&preg_match('/\A[A-Za-z0-9_-]{43}\z/',$key)===1,401,'Appairage de la passerelle requis.');
    $hash=hash('sha256',$key);
    foreach($state['devices']as$id=>$device)if(hash_equals($device['key_hash'],$hash))return $id;
    throw new SpError(401,'Appairage de la passerelle révoqué ou invalide.');
}
function sp3_session_patient(string $id,bool $auth=true): array {
    return sp_session($id,function(&$s)use($auth){
        if($auth)sp_assert(sp_role($s)==='practitioner',403,'Accès praticien requis.');
        sp_assert(!$s['closed'],409,'La séance est terminée.');
        return $s['patient'];
    });
}
function sp3_mapping(array $patient,string $company): string {
    $identity=[$company,SP3_CLIENT,$patient['source_pvs'],$patient['practice_number'],$patient['patient_id']];
    $name='map-'.hash_hmac('sha256',json_encode($identity,JSON_THROW_ON_ERROR),sp_key());
    $record=sp3_read($name);
    $demographics=[$patient['first_name'],$patient['last_name'],$patient['birth_date'],$patient['display_id']];
    if($record!==null){
        sp_assert($record['demographics']===$demographics,409,'L’identité a changé depuis le rattachement 3Shape. Vérifiez le dossier avant de poursuivre.');
        return $record['integration_id'];
    }
    $bytes=random_bytes(16);$bytes[6]=chr((ord($bytes[6])&15)|64);$bytes[8]=chr((ord($bytes[8])&63)|128);$hex=bin2hex($bytes);
    $id=substr($hex,0,8).'-'.substr($hex,8,4).'-'.substr($hex,12,4).'-'.substr($hex,16,4).'-'.substr($hex,20);
    sp3_write($name,['integration_id'=>$id,'demographics'=>$demographics]);return $id;
}
function sp3_device_create(array $data): array {
    sp_staff();$tokens=sp3_read('tokens');sp_assert($tokens!==null,409,'Reliez d’abord le compte 3Shape.');
    $company=sp3_company($tokens['access_token']);$label=sp_text($data['label']??'',80);
    return sp_locked('3shape_bridge',function()use($label,$company){
        $state=sp3_bridge_state();sp_assert(count($state['devices'])<20,409,'Limite de passerelles atteinte.');
        $id=bin2hex(random_bytes(16));$key=sp_token();
        $state['devices'][$id]=['label'=>$label,'company_id'=>$company,'key_hash'=>hash('sha256',$key),'last_seen'=>null];
        sp3_save_bridge($state);return ['device_id'=>$id,'device_key'=>$key,'company_id'=>$company];
    });
}
function sp3_device_revoke(array $data): array {
    sp_staff();return sp_locked('3shape_bridge',function()use($data){
        $state=sp3_bridge_state();$id=sp_text($data['device_id']??'',32);unset($state['devices'][$id]);
        foreach($state['jobs']as&$job)if($job['device_id']===$id&&in_array($job['status'],['queued','claimed'],true))$job['status']='cancelled';unset($job);
        sp3_save_bridge($state);return ['ok'=>true];
    });
}
function sp3_devices(array $state): array {
    $out=[];foreach($state['devices']as$id=>$d)$out[]=['id'=>$id,'label'=>$d['label'],'last_seen'=>$d['last_seen']];return $out;
}
function sp3_view(string $session): array {
    return sp_locked('3shape_bridge',function()use($session){
        sp3_session_patient($session);$state=sp3_bridge_state();sp3_load_jobs($state,$session);$jobs=[];$reports=[];
        foreach($state['jobs']as$id=>$job)if($job['session_id']===$session){
            $status=$job['status'];if($status==='claimed'&&time()-$job['claimed_at']>180)$status='uncertain';
            $jobs[]=['id'=>$id,'kind'=>$job['kind'],'status'=>$status,'error'=>$job['error']??null,'name'=>$job['file']['name']??null];
            if($job['kind']==='list'&&$status==='done'){$reports[$job['device_id']]=[];foreach($job['reports']as$i=>$r)$reports[$job['device_id']][]=['list_job'=>$id,'index'=>$i,'name'=>$r['name'],'capture_date'=>$r['capture_date'],'size'=>$r['size'],'device_id'=>$job['device_id']];}
        }
        return ['devices'=>sp3_devices($state),'jobs'=>$jobs,'reports'=>array_merge([], ...array_values($reports)),'clinical_ready'=>false];
    });
}
function sp3_enqueue(string $session,array $data): array {
    return sp_locked('3shape_bridge',function()use($session,$data){
        $patient=sp3_session_patient($session);$state=sp3_bridge_state();sp3_load_jobs($state,$session);
        $device=sp_text($data['device_id']??'',32);sp_assert(isset($state['devices'][$device]),409,'Choisissez une passerelle appairée.');
        $tokens=sp3_read('tokens');sp_assert($tokens!==null,409,'Reliez le compte 3Shape.');
        $company=sp3_company($tokens['access_token']);sp_assert($company===$state['devices'][$device]['company_id'],409,'Le compte 3Shape a changé de société. Réappairez la passerelle.');
        $kind=$data['kind']??'';sp_assert(in_array($kind,['open','list','download'],true),400,'Action 3Shape invalide.');
        foreach($state['jobs']as$id=>$job)if($job['session_id']===$session&&in_array($job['status'],['queued','claimed'],true)){
            if($job['kind']===$kind&&$job['device_id']===$device)return ['job_id'=>$id,'status'=>$job['status']];
            throw new SpError(409,'Une demande est déjà en cours. Vérifiez son résultat avant de recommencer.');
        }
        sp_assert(count($state['jobs'])<10000,409,'Historique de liaison plein. Purgez les séances terminées.');
        $job=['session_id'=>$session,'device_id'=>$device,'company_id'=>$company,'kind'=>$kind,'patient'=>$patient,
            'integration_id'=>sp3_mapping($patient,$company),'status'=>'queued','created_at'=>time()];
        if($kind==='download'){
            $list=$state['jobs'][$data['list_job']??'']??null;$index=$data['index']??null;
            sp_assert($list!==null&&$list['kind']==='list'&&$list['status']==='done'&&$list['session_id']===$session&&$list['device_id']===$device&&$list['company_id']===$company&&is_int($index)&&isset($list['reports'][$index]),400,'Rapport non rattaché à cette séance.');
            $job['file']=$list['reports'][$index];
        }
        $id=bin2hex(random_bytes(16));$state['jobs'][$id]=$job;sp3_save_bridge($state);return ['job_id'=>$id,'status'=>'queued'];
    });
}
function sp3_poll(): array {
    // Refresh outside the queue lock; an expired authorization cannot claim a job.
    $state=sp3_bridge_state();$device=sp3_device_auth($state);
    $token=sp3_access_token();$company=sp3_company($token);
    return sp_locked('3shape_bridge',function()use($device,$token,$company){
        $state=sp3_bridge_state();sp_assert(sp3_device_auth($state)===$device,401,'Passerelle révoquée.');
        sp_assert($state['devices'][$device]['company_id']===$company,409,'Société 3Shape incompatible.');
        $state['devices'][$device]['last_seen']=time();sp3_load_jobs($state,null,$device);$out=['job'=>null];
        foreach($state['jobs']as$id=>&$job){
            if($job['device_id']!==$device||$job['status']!=='queued')continue;
            try{$patient=sp3_session_patient($job['session_id'],false);}catch(SpError $e){$job['status']='cancelled';continue;}
            if(time()-$job['created_at']>900||$job['company_id']!==$company||$patient!==$job['patient']){$job['status']='cancelled';continue;}
            $job['status']='claimed';$job['claimed_at']=time();$job['claim_hash']=hash('sha256',$claim=sp_token());
            $out=['access_token'=>$token,'company_id'=>$company,'job'=>['id'=>$id,'claim'=>$claim,'kind'=>$job['kind'],
                'integration_id'=>$job['integration_id'],'patient'=>$job['patient'],'file'=>$job['file']??null]];break;
        }unset($job);sp3_save_bridge($state);return $out;
    });
}
function sp3_claimed(array $state,array $data,string $device): string {
    $id=sp_text($data['job_id']??'',32);$job=$state['jobs'][$id]??null;$claim=$data['claim']??'';
    sp_assert($job!==null&&$job['device_id']===$device&&$job['status']==='claimed'&&is_string($claim)&&strlen($claim)===43&&hash_equals($job['claim_hash'],hash('sha256',$claim)),409,'Demande absente, terminée ou non attribuée à cette passerelle.');
    sp3_session_patient($job['session_id'],false);return $id;
}
function sp3_finish_job(array $data): array {
    return sp_locked('3shape_bridge',function()use($data){
        $state=sp3_bridge_state();$device=sp3_device_auth($state);sp3_load_jobs($state,null,null,sp_text($data['job_id']??'',32));$id=sp3_claimed($state,$data,$device);$job=&$state['jobs'][$id];
        if(isset($data['error'])){
            sp_assert(in_array($data['error'],SP3_ERROR_CODES,true),400,'Erreur de liaison invalide.');$job['error']=$data['error'];$job['status']='error';
        }elseif($job['kind']==='open')$job['status']='accepted';
        elseif($job['kind']==='list'){
            $reports=$data['reports']??null;sp_assert(is_array($reports)&&array_is_list($reports)&&count($reports)<=100,400,'Liste de rapports invalide.');
            $clean=[];foreach($reports as$r){
                sp_assert(is_array($r)&&is_int($r['size']??null)&&$r['size']>0&&$r['size']<=SP3_PDF_LIMIT&&sp3_uuid($r['file_id']??''),400,'Rapport invalide.');
                $clean[]=['media_id'=>sp_text($r['media_id']??'',4096),'file_id'=>$r['file_id'],'name'=>sp_text($r['name']??'',256),'size'=>$r['size'],'capture_date'=>sp_text($r['capture_date']??'',80,false)];
            }$job['reports']=$clean;$job['status']='done';
        }else throw new SpError(400,'Le téléchargement exige un fichier PDF.');
        unset($job['claim_hash']);sp3_save_bridge($state);return ['ok'=>true];
    });
}
function sp3_store_pdf(array $data,string $raw): array {
    sp_assert(strlen($raw)<=SP3_PDF_LIMIT&&str_starts_with($raw,'%PDF-')&&str_contains(substr($raw,-2048),'%%EOF'),400,'PDF invalide.');
    return sp_locked('3shape_bridge',function()use($data,$raw){
        $state=sp3_bridge_state();$device=sp3_device_auth($state);sp3_load_jobs($state,null,null,sp_text($data['job_id']??'',32));$id=sp3_claimed($state,$data,$device);$job=&$state['jobs'][$id];
        sp_assert($job['kind']==='download'&&strlen($raw)===$job['file']['size'],400,'PDF différent du rapport demandé.');
        $iv=random_bytes(12);$tag='';$cipher=openssl_encrypt($raw,'aes-256-gcm',sp_key(),OPENSSL_RAW_DATA,$iv,$tag,'3shape-pdf-'.$id);
        sp_assert($cipher!==false,500,'Enregistrement PDF impossible.');sp_atomic(sp3_dir().'/pdf-'.$id.'.bin',$iv.$tag.$cipher);
        $job['status']='done';$job['sha256']=hash('sha256',$raw);unset($job['claim_hash']);sp3_save_bridge($state);return ['ok'=>true];
    });
}
function sp3_get_pdf(string $session,string $id): string {
    return sp_locked('3shape_bridge',function()use($session,$id){
        sp3_session_patient($session);$state=sp3_bridge_state();sp3_load_jobs($state,null,null,$id);$job=$state['jobs'][$id]??null;
        sp_assert($job!==null&&$job['session_id']===$session&&$job['kind']==='download'&&$job['status']==='done',404,'Rapport introuvable pour cette séance.');
        $path=sp3_dir().'/pdf-'.$id.'.bin';sp_assert(is_file($path)&&filesize($path)<=SP3_PDF_LIMIT+28,404,'Rapport indisponible.');
        $box=file_get_contents($path);$raw=openssl_decrypt(substr($box,28),'aes-256-gcm',sp_key(),OPENSSL_RAW_DATA,substr($box,0,12),substr($box,12,16),'3shape-pdf-'.$id);
        sp_assert($raw!==false&&hash_equals($job['sha256'],hash('sha256',$raw)),500,'Vérification du rapport impossible.');return $raw;
    });
}
function sp3_cancel_job(string $session,array $data): array {
    return sp_locked('3shape_bridge',function()use($session,$data){
        sp3_session_patient($session);$state=sp3_bridge_state();$id=sp_text($data['job_id']??'',32);sp3_load_jobs($state,null,null,$id);$job=&$state['jobs'][$id];
        sp_assert(is_array($job)&&$job['session_id']===$session,404,'Demande introuvable.');
        sp_assert(in_array($job['status'],['queued','claimed'],true),409,'La demande est déjà terminée.');
        $job['status']='cancelled';unset($job['claim_hash']);sp3_save_bridge($state);return ['ok'=>true];
    });
}
function sp3_purge_session(string $session): void {
    sp_locked('3shape_bridge',function()use($session){
        $state=sp3_bridge_state();foreach($state['jobs']as$id=>$job)if($job['session_id']===$session){
            $path=sp3_dir().'/pdf-'.$id.'.bin';if(is_file($path))unlink($path);$record=sp3_dir().'/job-'.$id.'.enc';if(is_file($record))unlink($record);unset($state['jobs'][$id]);
        }sp3_save_bridge($state);
    });
}
