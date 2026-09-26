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

hub_require_admin($config);
$csrf = hub_csrf_token();

$flash = '';
$flashType = 'ok';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $action = (string)($_POST['action'] ?? '');
    $id = trim((string)($_POST['id'] ?? ''));
    $token = (string)($_POST['csrf'] ?? '');

    if (!$status['api_key']) {
        $flash = 'Configure d’abord la clé du Social Hub.';
        $flashType = 'warn';
    } elseif (!hub_validate_csrf($token)) {
        $flash = 'La session a expiré. Recharge la page et réessaie.';
        $flashType = 'warn';
    } elseif ($action === 'trash' && (string)($_POST['confirmation'] ?? '') === 'TRASH') {
        $drafts = hub_load_drafts();
        $index = hub_find_draft_index($drafts, $id);
        if ($index < 0) {
            $flash = 'Publication introuvable.';
            $flashType = 'warn';
        } elseif (in_array((string)($drafts[$index]['status'] ?? ''), ['trashed', 'trash_partial'], true)) {
            $flash = 'Cette publication est déjà dans la corbeille.';
            $flashType = 'warn';
        } else {
            $previousStatus = (string)($drafts[$index]['status'] ?? 'draft');
            $removal = [];
            if ($previousStatus === 'published') {
                $removal = hub_suspend_online($config, $drafts[$index]);
            }
            $failed = array_filter(
                $removal,
                static fn (mixed $item): bool => is_array($item) && !((bool)($item['ok'] ?? false))
            );
            $drafts[$index]['previous_status'] = $previousStatus;
            $drafts[$index]['status'] = $failed === [] ? 'trashed' : 'trash_partial';
            $drafts[$index]['trashed_at'] = gmdate('c');
            $drafts[$index]['remote_removal'] = $removal;
            hub_save_drafts($drafts);

            if ($failed === []) {
                $flash = $previousStatus === 'published'
                    ? 'Publication placée dans la corbeille et retrait en ligne demandé avec succès.'
                    : 'Publication placée dans la corbeille.';
            } else {
                $flash = 'Publication mise dans la corbeille, mais au moins un réseau demande encore une action manuelle.';
                $flashType = 'warn';
            }
        }
    }
}

$items = hub_load_drafts();
usort($items, static function (array $a, array $b): int {
    $aDate = (string)($a['published_at'] ?? $a['created_at'] ?? '');
    $bDate = (string)($b['published_at'] ?? $b['created_at'] ?? '');
    return strcmp($bDate, $aDate);
});

$active = array_values(array_filter(
    $items,
    static fn (array $item): bool => !in_array((string)($item['status'] ?? ''), ['trashed', 'trash_partial'], true)
));
$trash = array_values(array_filter(
    $items,
    static fn (array $item): bool => in_array((string)($item['status'] ?? ''), ['trashed', 'trash_partial'], true)
));

function hub_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function hub_display_date(array $item): string
{
    $raw = (string)($item['published_at'] ?? $item['approved_at'] ?? $item['created_at'] ?? '');
    if ($raw === '') {
        return '—';
    }
    try {
        $date = new DateTimeImmutable($raw);
        $date = $date->setTimezone(new DateTimeZone('Europe/Zurich'));
        return $date->format('d.m.Y · H:i');
    } catch (Throwable) {
        return $raw;
    }
}

function hub_status_label(string $status): string
{
    return match ($status) {
        'draft' => 'Brouillon',
        'approved' => 'Approuvée',
        'published' => 'En ligne',
        'publish_failed' => 'Échec publication',
        'trashed' => 'Corbeille',
        'trash_partial' => 'Retrait incomplet',
        default => ucfirst($status ?: 'Inconnu'),
    };
}

function hub_render_publication(array $item, string $csrf, bool $canTrash): void
{
    $id = (string)($item['id'] ?? '');
    $caption = (string)($item['caption'] ?? '');
    $title = trim((string)($item['title'] ?? ''));
    if ($title === '') {
        $title = hub_derive_title($caption);
    }
    $media = trim((string)($item['media_url'] ?? ''));
    $state = (string)($item['status'] ?? 'draft');
    $platforms = array_map('strval', (array)($item['platforms'] ?? []));
    $isTrash = in_array($state, ['trashed', 'trash_partial'], true);
    $manual = $state === 'trash_partial';
    ?>
    <article class="pub-row">
      <div class="thumb">
        <?php if ($media !== ''): ?>
          <img src="<?= hub_escape($media) ?>" alt="">
        <?php else: ?>
          <div class="thumb-empty" aria-hidden="true">SP</div>
        <?php endif; ?>
      </div>
      <div class="pub-main">
        <div class="pub-top">
          <div>
            <h3><?= hub_escape($title) ?></h3>
            <div class="meta"><?= hub_escape(hub_display_date($item)) ?></div>
          </div>
          <span class="status status-<?= hub_escape($state) ?>"><?= hub_escape(hub_status_label($state)) ?></span>
        </div>
        <p class="excerpt"><?= hub_escape(mb_strlen($caption) > 180 ? mb_substr($caption, 0, 180) . '…' : $caption) ?></p>
        <div class="pub-bottom">
          <div class="platforms">
            <?php foreach ($platforms as $platform): ?>
              <span class="platform"><?= hub_escape(ucfirst($platform)) ?></span>
            <?php endforeach; ?>
            <?php if ($manual): ?>
              <span class="manual">Action manuelle requise sur un réseau</span>
            <?php endif; ?>
          </div>
          <?php if (!$isTrash): ?>
            <form method="post" class="trash-form">
              <input type="hidden" name="csrf" value="<?= hub_escape($csrf) ?>">
              <input type="hidden" name="action" value="trash">
              <input type="hidden" name="id" value="<?= hub_escape($id) ?>">
              <input type="hidden" name="confirmation" value="TRASH">
              <button type="submit" class="trash-btn" <?= $canTrash ? '' : 'disabled' ?>
                data-title="<?= hub_escape($title) ?>">Corbeille</button>
            </form>
          <?php endif; ?>
        </div>
      </div>
    </article>
    <?php
}
?><!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>SourirePlus Social Hub</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172235;background:#f5f7fa}
    *{box-sizing:border-box}body{margin:0}.wrap{max-width:1100px;margin:0 auto;padding:36px 18px 70px}
    .hero{background:#fff;border:1px solid #e5e9ef;border-radius:22px;padding:28px}
    .eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.11em;color:#7a8594}.hero h1{font-size:31px;margin:5px 0 7px}.hero p{margin:0;color:#5f6c7c;line-height:1.55}
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}.metric{padding:16px;border:1px solid #e6eaf0;border-radius:15px;background:#fafbfc}.metric b{display:block;margin-top:4px;font-size:18px}.ok{color:#177254}.wait{color:#9a6716}
    .flash{margin:18px 0 0;padding:13px 15px;border-radius:13px;background:#edf7f2;color:#185f47}.flash.warn{background:#fff5df;color:#7f5711}
    .section{margin-top:28px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:12px}.section h2{font-size:21px;margin:0}.count{font-size:13px;color:#748092}
    .pub-list{display:grid;gap:10px}.pub-row{display:grid;grid-template-columns:116px minmax(0,1fr);gap:16px;padding:13px;background:#fff;border:1px solid #e4e8ee;border-radius:17px}.thumb{width:116px;height:88px;border-radius:12px;overflow:hidden;background:#edf0f4}.thumb img{width:100%;height:100%;object-fit:cover}.thumb-empty{width:100%;height:100%;display:grid;place-items:center;font-weight:800;color:#8b95a4;font-size:20px}
    .pub-main{min-width:0}.pub-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.pub-top h3{font-size:17px;margin:1px 0 4px;line-height:1.3}.meta{font-size:13px;color:#7a8594}.excerpt{font-size:14px;line-height:1.45;color:#536173;margin:9px 0 12px}.pub-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.platforms{display:flex;gap:6px;flex-wrap:wrap}.platform,.manual,.status{font-size:12px;border-radius:999px;padding:5px 9px;background:#f0f3f6;color:#536173}.status-published{background:#e9f6ef;color:#176a4e}.status-approved{background:#eef2ff;color:#4557a6}.status-publish_failed,.status-trash_partial{background:#fff0e7;color:#9a4d22}.status-trashed{background:#eceff3;color:#606b78}.manual{background:#fff0e7;color:#9a4d22}
    .trash-btn{border:1px solid #e2c9c9;background:#fff7f7;color:#8a3535;border-radius:11px;padding:9px 12px;font-weight:650;cursor:pointer}.trash-btn:disabled{opacity:.45;cursor:not-allowed}.empty{padding:25px;text-align:center;border:1px dashed #d8dee7;border-radius:16px;color:#7a8594;background:#fafbfc}.note{margin-top:14px;font-size:13px;line-height:1.5;color:#667487}.foot{margin-top:30px;color:#7b8796;font-size:13px}
    @media(max-width:760px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pub-row{grid-template-columns:88px minmax(0,1fr)}.thumb{width:88px;height:76px}.pub-top{display:block}.status{display:inline-block;margin-top:7px}}
    @media(max-width:430px){.wrap{padding:20px 12px 50px}.hero{padding:20px}.grid{grid-template-columns:1fr 1fr}.pub-row{grid-template-columns:1fr}.thumb{width:100%;height:160px}.pub-bottom{align-items:stretch}.trash-form,.trash-btn{width:100%}}
  </style>
</head>
<body>
<main class="wrap">
  <section class="hero">
    <div class="eyebrow">Clinique SourirePlus</div>
    <h1>Social Hub</h1>
    <p>Historique des contenus préparés et publiés. La corbeille conserve la fiche du contenu et tente de retirer la publication du réseau lorsqu’elle était déjà en ligne.</p>

    <div class="grid">
      <div class="metric"><span class="eyebrow">API</span><b class="<?= $status['api_key'] ? 'ok' : 'wait' ?>"><?= $status['api_key'] ? 'Configurée' : 'À configurer' ?></b></div>
      <div class="metric"><span class="eyebrow">Facebook</span><b class="<?= $status['facebook'] ? 'ok' : 'wait' ?>"><?= $status['facebook'] ? 'Connecté' : 'À connecter' ?></b></div>
      <div class="metric"><span class="eyebrow">Instagram</span><b class="<?= $status['instagram'] ? 'ok' : 'wait' ?>"><?= $status['instagram'] ? 'Connecté' : 'À connecter' ?></b></div>
      <div class="metric"><span class="eyebrow">Publications</span><b><?= count($active) ?></b></div>
    </div>

    <?php if ($flash !== ''): ?>
      <div class="flash <?= $flashType === 'warn' ? 'warn' : '' ?>"><?= hub_escape($flash) ?></div>
    <?php endif; ?>

    <div class="note">Pour un contenu déjà publié, « Corbeille » envoie aussi une demande de retrait au réseau. Si l’API du réseau refuse le retrait, la ligne reste signalée « Retrait incomplet » afin qu’on sache qu’une intervention manuelle est encore nécessaire.</div>
  </section>

  <section class="section">
    <div class="section-head">
      <h2>Publications</h2>
      <span class="count"><?= count($active) ?> élément<?= count($active) > 1 ? 's' : '' ?></span>
    </div>
    <div class="pub-list">
      <?php if ($active === []): ?>
        <div class="empty">Aucune publication enregistrée pour le moment.</div>
      <?php else: ?>
        <?php foreach ($active as $item) hub_render_publication($item, $csrf, $status['api_key']); ?>
      <?php endif; ?>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <h2>Corbeille</h2>
      <span class="count"><?= count($trash) ?> élément<?= count($trash) > 1 ? 's' : '' ?></span>
    </div>
    <div class="pub-list">
      <?php if ($trash === []): ?>
        <div class="empty">La corbeille est vide.</div>
      <?php else: ?>
        <?php foreach ($trash as $item) hub_render_publication($item, $csrf, false); ?>
      <?php endif; ?>
    </div>
  </section>

  <div class="foot">Chaque fiche conserve la date, le titre, la vignette, les réseaux visés et l’état de retrait.</div>
</main>
<script>
(() => {
  document.querySelectorAll('.trash-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const button = form.querySelector('.trash-btn');
      const title = button?.dataset.title || 'cette publication';
      if (!window.confirm('Mettre « ' + title + ' » dans la corbeille ? Si elle est déjà en ligne, le Social Hub tentera aussi de la retirer du réseau.')) {
        event.preventDefault();
      }
    });
  });
})();
</script>
</body>
</html>
