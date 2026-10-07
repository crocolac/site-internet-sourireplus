<?php
declare(strict_types=1);
require dirname(__DIR__,3).'/visite/lib.php';
require dirname(__DIR__,3).'/visite/3shape.php';
header('Cache-Control: no-store, private');header('Referrer-Policy: no-referrer');
header('Content-Type: text/plain; charset=utf-8');header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
try {
    sp_assert(($_SERVER['REQUEST_METHOD']??'GET')==='GET',405,'GET requis.');
    $binding=$_COOKIE['sp_3shape_binding']??'';
    sp_assert(is_string($binding),400,'Navigateur de connexion invalide.');
    sp3_finish($_GET,$binding);
    setcookie('sp_3shape_binding','',['expires'=>1,'path'=>'/methode/','secure'=>true,'httponly'=>true,'samesite'=>'Lax']);
    header('Location: https://sourireplus.ch/methode/visite/#integration=3shape',true,303);
} catch(SpError $e) { http_response_code($e->status);echo $e->getMessage(); }
catch(Throwable $e) { http_response_code(503);echo 'Connexion indisponible. Recommencez depuis l’espace équipe SourirePlus.'; }
