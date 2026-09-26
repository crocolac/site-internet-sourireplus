<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
$config = hub_config();
$status = [
    'api_key' => (string)($config['api_key'] ?? '') !== '',
    'facebook' => (string)($config['page_id'] ?? '') !== '' && (string)($config['page_access_token'] ?? '') !== '',
    'instagram' => (string)($config['instagram_user_id'] ?? '') !== '' && (string)($config['page_access_token'] ?? '') !== '',
];
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, max-age=0');
?><!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>SourirePlus Social Hub</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#152235;background:#f6f8fb}
    *{box-sizing:border-box}body{margin:0}.wrap{max-width:960px;margin:0 auto;padding:48px 20px 80px}
    .hero{background:#fff;border:1px solid #e6eaf0;border-radius:24px;padding:32px;box-shadow:0 12px 35px rgba(15,35,60,.08)}
    h1{font-size:32px;margin:0 0 8px}p{line-height:1.55;color:#546174}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-top:24px}
    .card{background:#fff;border:1px solid #e6eaf0;border-radius:18px;padding:20px}.label{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#7c8797}.value{font-size:20px;font-weight:700;margin-top:8px}
    .ok{color:#1d7a55}.wait{color:#a66b12}.rules{margin-top:22px;padding:18px;border-radius:16px;background:#eef5ff;color:#234361}.foot{margin-top:22px;font-size:14px;color:#667487}
    code{background:#edf0f4;padding:2px 6px;border-radius:7px}
  </style>
</head>
<body>
<main class="wrap">
  <section class="hero">
    <div class="label">Clinique SourirePlus</div>
    <h1>Social Hub</h1>
    <p>Passerelle légère entre ChatGPT et les réseaux sociaux. Cette page n’affiche aucun secret et aucune publication ne peut partir sans une approbation explicite préalable.</p>
    <div class="grid">
      <div class="card"><div class="label">API sécurisée</div><div class="value <?= $status['api_key'] ? 'ok' : 'wait' ?>"><?= $status['api_key'] ? 'Configurée' : 'À configurer' ?></div></div>
      <div class="card"><div class="label">Facebook</div><div class="value <?= $status['facebook'] ? 'ok' : 'wait' ?>"><?= $status['facebook'] ? 'Connecté' : 'À connecter' ?></div></div>
      <div class="card"><div class="label">Instagram</div><div class="value <?= $status['instagram'] ? 'ok' : 'wait' ?>"><?= $status['instagram'] ? 'Connecté' : 'À connecter' ?></div></div>
      <div class="card"><div class="label">Meta Graph</div><div class="value ok"><?= htmlspecialchars((string)($config['graph_version'] ?? 'v26.0'), ENT_QUOTES, 'UTF-8') ?></div></div>
    </div>
    <div class="rules"><strong>Règle de sécurité :</strong> brouillon → approbation <code>APPROVE</code> → confirmation de publication <code>PUBLISH</code>. Les trois étapes sont imposées par le serveur.</div>
    <div class="foot">État technique : <a href="api.php?action=status">api.php?action=status</a></div>
  </section>
</main>
</body>
</html>
