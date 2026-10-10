<?php
declare(strict_types=1);
require __DIR__.'/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
function sp_reply(array $value,int $status=200): never { http_response_code($status); echo json_encode($value,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR); exit; }
try {
    $method=$_SERVER['REQUEST_METHOD']??'GET'; $action=$_GET['action']??'status';
    sp_assert(is_string($action),400,'Action invalide.');
    sp_assert(in_array($method,['GET','POST'],true),405,'Méthode non autorisée.');
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    sp_assert($origin==='' || $origin===rtrim(getenv('SOURIREPLUS_METHOD_TEST_ORIGIN')?:'https://sourireplus.ch','/'),403,'Origine non autorisée.');
    sp_assert(($_SERVER['HTTP_SEC_FETCH_SITE']??'')!=='cross-site',403,'Origine non autorisée.');
    if($action==='status') { sp_config(); sp_reply(['ok'=>true,'service'=>'SourirePlus Method','version'=>SP_VERSION]); }
    if($action==='3shape-upload') {
        sp_assert($method==='POST',405,'POST requis.');require_once __DIR__.'/3shape-bridge.php';
        sp3_device_auth(sp3_bridge_state());
        sp_assert(strtolower(explode(';',$_SERVER['CONTENT_TYPE']??'')[0])==='application/pdf',415,'PDF requis.');
        sp_assert((int)($_SERVER['CONTENT_LENGTH']??0)<=SP3_PDF_LIMIT,413,'PDF trop volumineux.');
        $raw=file_get_contents('php://input',false,null,0,SP3_PDF_LIMIT+1);
        sp_reply(sp3_store_pdf(['job_id'=>$_SERVER['HTTP_X_SOURIREPLUS_JOB']??'','claim'=>$_SERVER['HTTP_X_SOURIREPLUS_CLAIM']??''],$raw));
    }
    $data=[];
    if($method==='POST') {
        sp_assert(str_starts_with(strtolower($_SERVER['CONTENT_TYPE']??''),'application/json'),415,'Format JSON requis.');
        sp_assert((int)($_SERVER['CONTENT_LENGTH']??0)<=65536,413,'Demande trop volumineuse.');
        $raw=file_get_contents('php://input',false,null,0,65537); sp_assert(strlen($raw)<=65536,413,'Demande trop volumineuse.');
        $data=json_decode($raw,true,16,JSON_THROW_ON_ERROR); sp_assert(is_array($data)&&str_starts_with(ltrim($raw),'{'),400,'Objet JSON requis.');
    }
    if($action==='login') {
        sp_assert($method==='POST',405,'POST requis.');
        // Bound failed attempts per source without recording the raw address or secret.
        $limitName='auth_'.substr(hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'',sp_key()),0,32);
        sp_locked($limitName,function()use($limitName,$data) {
            $path=sp_dir().'/'.$limitName.'.json'; $limit=is_file($path)?json_decode(file_get_contents($path),true):['since'=>time(),'count'=>0];
            if(time()-$limit['since']>900)$limit=['since'=>time(),'count'=>0];
            sp_assert($limit['count']<20,429,'Trop de tentatives. Réessayez dans quinze minutes.');
            $key=$data['key']??'';
            if(!sp_password_valid($key)) {
                $limit['count']++; sp_atomic($path,json_encode($limit)); throw new SpError(401,'Code d’accès incorrect.');
            }
            if(is_file($path))unlink($path);
        });
        $cookie=(time()+43200).'.'.bin2hex(random_bytes(12)); $cookie.='.'.hash_hmac('sha256',$cookie,sp_staff_cookie_key());
        setcookie('sp_method_staff',$cookie,['expires'=>time()+43200,'path'=>'/methode/visite/','secure'=>!getenv('SOURIREPLUS_METHOD_TEST_ORIGIN'),'httponly'=>true,'samesite'=>'Strict']);
        sp_reply(['ok'=>true]);
    }
    if($action==='logout') {
        sp_assert($method==='POST',405,'POST requis.');
        setcookie('sp_method_staff','',['expires'=>1,'path'=>'/methode/visite/','secure'=>!getenv('SOURIREPLUS_METHOD_TEST_ORIGIN'),'httponly'=>true,'samesite'=>'Strict']); sp_reply(['ok'=>true]);
    }
    if(in_array($action,['3shape-device-create','3shape-device-revoke','3shape-devices','3shape-poll','3shape-finish','3shape-view','3shape-enqueue','3shape-cancel','3shape-pdf'],true)) {
        require_once __DIR__.'/3shape-bridge.php';
        if($action==='3shape-devices'){sp_staff();sp_assert($method==='GET',405,'GET requis.');sp_reply(['devices'=>sp3_devices(sp3_bridge_state())]);}
        if($action==='3shape-view'){sp_assert($method==='GET',405,'GET requis.');sp_reply(sp3_view(sp_text($_SERVER['HTTP_X_SOURIREPLUS_SESSION']??'',32)));}
        if($action==='3shape-pdf'){
            sp_assert($method==='GET',405,'GET requis.');$pdf=sp3_get_pdf(sp_text($_SERVER['HTTP_X_SOURIREPLUS_SESSION']??'',32),sp_text($_GET['job_id']??'',32));
            header('Content-Type: application/pdf');header('Content-Disposition: attachment; filename="rapport-3shape.pdf"');header('Content-Length: '.strlen($pdf));echo $pdf;exit;
        }
        sp_assert($method==='POST',405,'POST requis.');
        if($action==='3shape-device-create')sp_reply(sp3_device_create($data),201);
        if($action==='3shape-device-revoke')sp_reply(sp3_device_revoke($data));
        if($action==='3shape-poll')sp_reply(sp3_poll());
        if($action==='3shape-finish')sp_reply(sp3_finish_job($data));
        $session=sp_text($_SERVER['HTTP_X_SOURIREPLUS_SESSION']??'',32);
        if($action==='3shape-enqueue')sp_reply(sp3_enqueue($session,$data),202);
        sp_reply(sp3_cancel_job($session,$data));
    }
    if(in_array($action,['3shape-status','3shape-start','3shape-disconnect'],true)) {
        sp_staff(); require __DIR__.'/3shape.php';
        if($action==='3shape-status'){sp_assert($method==='GET',405,'GET requis.');sp_reply(sp3_status());}
        sp_assert($method==='POST',405,'POST requis.');
        if($action==='3shape-disconnect'){sp3_disconnect();sp_reply(['ok'=>true]);}
        $flow=sp3_start();
        setcookie('sp_3shape_binding',$flow['binding'],['expires'=>time()+600,'path'=>'/methode/','secure'=>!getenv('SOURIREPLUS_METHOD_TEST_ORIGIN'),'httponly'=>true,'samesite'=>'Lax']);
        sp_reply(['authorization_url'=>$flow['authorization_url']]);
    }
    if(in_array($action,['staff','sessions','create','join','reopen','purge'],true)) {
        if($action==='create')sp_create_access();else sp_staff();
        if($action==='staff')sp_reply(['ok'=>true]);
        if($action==='create') { sp_assert($method==='POST',405,'POST requis.'); sp_reply(sp_create($data),201); }
        if($action==='purge') {
            sp_assert($method==='POST',405,'POST requis.');
            $id=sp_text($data['session_id']??'',32);
            sp_assert(($data['confirm_session_id']??null)===$id,400,'Confirmez la séance à purger.');
            sp_assert(preg_match('/\A[a-f0-9]{32}\z/',$id)===1,400,'Identifiant de séance invalide.');
            sp_locked($id,function()use($id) {
                $path=sp_dir().'/'.$id.'.enc';
                sp_assert(is_file($path),404,'Séance introuvable.');
                sp_assert(unlink($path),500,'Suppression impossible.');
                // Keep the lock inode so a waiting request cannot race a new lock.
            });
            require_once __DIR__.'/3shape-bridge.php';sp3_purge_session($id);
            sp_reply(['ok'=>true,'purged'=>$id]);
        }
        if($action==='join') {
            sp_assert($method==='POST',405,'POST requis.');
            sp_reply(sp_session(sp_text($data['session_id']??'',32),function(&$s) {
                sp_assert(!$s['closed']&&$s['access_until']>=time(),409,'Cette séance est terminée ou ses liens ont expiré. Actualisez la liste, puis reprenez la séance.');
                return ['session_id'=>$s['id'],'links'=>sp_links($s)];
            }));
        }
        if($action==='reopen') {
            sp_assert($method==='POST',405,'POST requis.');
            sp_reply(sp_session(sp_text($data['session_id']??'',32),function(&$s) {
                $s['closed']=false; $s['access_until']=time()+43200;
                $s['tokens']=['presentation'=>sp_token(),'practitioner'=>sp_token()]; $s['revision']++;
                return ['session_id'=>$s['id'],'links'=>sp_links($s)];
            }));
        }
        $items=[]; $files=glob(sp_dir().'/*.enc'); usort($files,fn($a,$b)=>filemtime($b)<=>filemtime($a));
        foreach(array_slice($files,0,200)as$file) {
            try { $items[]=sp_session(basename($file,'.enc'),fn(&$s)=>['session_id'=>$s['id'],'name'=>$s['patient']['name'],'dossier'=>$s['patient']['display_id']?:$s['patient']['patient_id'],'date'=>$s['created_at'],'updated_at'=>$s['updated_at'],'closed'=>$s['closed'],'joinable'=>!$s['closed']&&$s['access_until']>=time(),'complete'=>sp_ready($s)]); }
            catch(SpError $e) { if($e->status!==404)throw $e; }
        }
        sp_reply(['sessions'=>$items]);
    }
    $id=sp_text($_SERVER['HTTP_X_SOURIREPLUS_SESSION']??'',32);
    if($action==='reference') {
        sp_assert($method==='GET',405,'GET requis.');
        // Release the session lock before reading the public reference file.
        sp_session($id,fn(&$s)=>sp_role($s));
        $context=stream_context_create([
            'http'=>['timeout'=>5,'follow_location'=>0,'header'=>"Accept: application/json\r\nCache-Control: no-cache\r\n"],
            'ssl'=>['verify_peer'=>true,'verify_peer_name'=>true]
        ]);
        $stream=@fopen('https://mydentalpass.ch/courbes/fond-trajectoire.json','rb',false,$context);
        sp_assert($stream!==false,503,'Les repères de vie sont momentanément indisponibles.');
        try { $raw=stream_get_contents($stream,262145); $meta=stream_get_meta_data($stream); }
        finally { fclose($stream); }
        sp_assert(is_string($raw)&&strlen($raw)<=262144&&!($meta['timed_out']??false)&&preg_match('/^HTTP\/\S+ 200(?: |$)/',$meta['wrapper_data'][0]??'')===1,503,'Les repères de vie sont momentanément indisponibles.');
        try { $reference=json_decode($raw,true,32,JSON_THROW_ON_ERROR); }
        catch(JsonException $e) { throw new SpError(503,'Les repères de vie sont momentanément indisponibles.'); }
        sp_assert(is_array($reference)&&($reference['schema']??null)==='sourire-plus-fond-trajectoire'&&is_array($reference['series']??null)&&count($reference['series'])===6,503,'Les repères de vie sont momentanément indisponibles.');
        sp_reply($reference);
    }
    $result=sp_session($id,function(&$s)use($action,$data,$method) {
        $role=sp_role($s);
        if($action==='state') { sp_assert($method==='GET',405,'GET requis.'); return sp_state($s,$role); }
        sp_assert($method==='POST',405,'POST requis.'); return sp_mutate($s,$role,$action,$data);
    }); sp_reply($result);
} catch(SpError $e) { sp_reply(['error'=>$e->getMessage()],$e->status); }
catch(JsonException $e) { sp_reply(['error'=>'Données JSON invalides.'],400); }
catch(Throwable $e) { sp_reply(['error'=>'Service momentanément indisponible. Votre dernière action n’est pas confirmée.'],500); }
