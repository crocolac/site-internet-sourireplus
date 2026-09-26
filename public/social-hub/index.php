<?php
declare(strict_types=1);

require __DIR__ . '/lib.php';

$config = hub_config();
$accounts = hub_accounts($config);
$apiConfigured = (string)($config['api_key'] ?? '') !== '';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, max-age=0');

hub_require_admin($config);
$csrf = hub_csrf_token();

$flash = '';
$flashType = 'ok';

function hub_web_flash(string $message, string $type = 'ok'): void
{
    global $flash, $flashType;
    $flash = $message;
    $flashType = $type;
}

function hub_apply_publish_result(array &$drafts, int $index, array $publication): void
{
    $results = (array)($publication['results'] ?? []);
    $errors = (array)($publication['errors'] ?? []);
    $manual = (array)($publication['manual'] ?? []);
    $drafts[$index]['results'] = $results;
    $drafts[$index]['errors'] = $errors;
    $drafts[$index]['manual'] = $manual;

    $automated = count($results) - count($manual);
    if ($errors !== []) {
        $drafts[$index]['status'] = $automated > 0 ? 'partially_published' : 'publish_failed';
    } elseif ($manual !== [] && $automated === 0) {
        $drafts[$index]['status'] = 'manual_ready';
    } elseif ($manual !== []) {
        $drafts[$index]['status'] = 'partially_published';
        $drafts[$index]['published_at'] = gmdate('c');
    } else {
        $drafts[$index]['status'] = 'published';
        $drafts[$index]['published_at'] = gmdate('c');
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $action = (string)($_POST['action'] ?? '');
    $token = (string)($_POST['csrf'] ?? '');

    if (!$apiConfigured) {
        hub_web_flash('Configure d’abord la clé du Social Hub dans GitHub Actions.', 'warn');
    } elseif (!hub_validate_csrf($token)) {
        hub_web_flash('La session a expiré. Recharge la page et réessaie.', 'warn');
    } elseif ($action === 'create') {
        try {
            $caption = trim((string)($_POST['caption'] ?? ''));
            $title = trim((string)($_POST['title'] ?? ''));
            $contentType = hub_valid_content_type((string)($_POST['content_type'] ?? 'post'));
            $accountKey = trim((string)($_POST['account'] ?? 'pro'));
            $platforms = hub_valid_platforms($_POST['platforms'] ?? []);
            $mediaUrl = trim((string)($_POST['media_url'] ?? ''));

            if ($caption === '') {
                throw new RuntimeException('Ajoute un texte ou une légende.');
            }
            if ($contentType === '') {
                throw new RuntimeException('Choisis Publication, Reel ou Story.');
            }
            if (hub_account($config, $accountKey) === []) {
                throw new RuntimeException('Compte social inconnu.');
            }
            if ($platforms === []) {
                throw new RuntimeException('Choisis au moins un réseau.');
            }
            if ($mediaUrl !== '' && filter_var($mediaUrl, FILTER_VALIDATE_URL) === false) {
                throw new RuntimeException('L’URL du média n’est pas valide.');
            }

            if (isset($_FILES['media']) && is_array($_FILES['media'])) {
                $uploaded = hub_store_uploaded_media($_FILES['media'], $config);
                if ($uploaded !== '') {
                    $mediaUrl = $uploaded;
                }
            }
            if (in_array($contentType, ['reel', 'story'], true) && $mediaUrl === '') {
                throw new RuntimeException('Un Reel ou une Story nécessite une image ou une vidéo.');
            }
            if ($title === '') {
                $title = hub_derive_title($caption);
            }

            $drafts = hub_load_drafts();
            $drafts[] = [
                'id' => bin2hex(random_bytes(8)),
                'title' => mb_substr($title, 0, 140),
                'caption' => mb_substr($caption, 0, 5000),
                'content_type' => $contentType,
                'account' => $accountKey,
                'platforms' => $platforms,
                'media_url' => $mediaUrl,
                'share_to_feed' => isset($_POST['share_to_feed']),
                'status' => 'draft',
                'created_at' => gmdate('c'),
                'approved_at' => null,
                'published_at' => null,
                'trashed_at' => null,
                'results' => [],
            ];
            hub_save_drafts($drafts);
            hub_web_flash('Brouillon créé. Vérifie-le puis clique sur « Approuver ».');
        } catch (Throwable $exception) {
            hub_web_flash($exception->getMessage(), 'warn');
        }
    } else {
        $id = trim((string)($_POST['id'] ?? ''));
        $drafts = hub_load_drafts();
        $index = hub_find_draft_index($drafts, $id);

        if ($index < 0) {
            hub_web_flash('Publication introuvable.', 'warn');
        } elseif ($action === 'approve') {
            if (($drafts[$index]['status'] ?? '') !== 'draft') {
                hub_web_flash('Ce contenu n’est plus au stade brouillon.', 'warn');
            } else {
                $drafts[$index]['status'] = 'approved';
                $drafts[$index]['approved_at'] = gmdate('c');
                hub_save_drafts($drafts);
                hub_web_flash('Publication approuvée. Elle peut maintenant être publiée.');
            }
        } elseif ($action === 'publish') {
            if (($drafts[$index]['status'] ?? '') !== 'approved') {
                hub_web_flash('La publication doit être approuvée avant envoi.', 'warn');
            } else {
                try {
                    $publication = hub_publish_draft($config, $drafts[$index]);
                    hub_apply_publish_result($drafts, $index, $publication);
                    hub_save_drafts($drafts);
                    $manual = (array)($publication['manual'] ?? []);
                    $errors = (array)($publication['errors'] ?? []);
                    if ($errors !== []) {
                        hub_web_flash('Publication partielle ou en échec. Consulte les détails dans la fiche.', 'warn');
                    } elseif ($manual !== []) {
                        hub_web_flash('La partie automatisable est terminée. Une action manuelle reste nécessaire sur au moins un compte/réseau.', 'warn');
                    } else {
                        hub_web_flash('Publication envoyée avec succès.');
                    }
                } catch (Throwable $exception) {
                    hub_web_flash('Échec de publication : ' . $exception->getMessage(), 'warn');
                }
            }
        } elseif ($action === 'mark_published') {
            if (!in_array((string)($drafts[$index]['status'] ?? ''), ['manual_ready', 'partially_published', 'publish_failed'], true)) {
                hub_web_flash('Ce contenu ne peut pas être marqué publié à ce stade.', 'warn');
            } else {
                $drafts[$index]['status'] = 'published';
                $drafts[$index]['published_at'] = gmdate('c');
                $drafts[$index]['manual_marked_published'] = true;
                hub_save_drafts($drafts);
                hub_web_flash('Publication marquée comme mise en ligne manuellement.');
            }
        } elseif ($action === 'trash') {
            if (in_array((string)($drafts[$index]['status'] ?? ''), ['trashed', 'trash_partial'], true)) {
                hub_web_flash('Cette publication est déjà dans la corbeille.', 'warn');
            } else {
                $previousStatus = (string)($drafts[$index]['status'] ?? 'draft');
                $removal = [];
                if (in_array($previousStatus, ['published', 'partially_published'], true)) {
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
                    hub_web_flash(
                        in_array($previousStatus, ['published', 'partially_published'], true)
                            ? 'Publication mise dans la corbeille et demande de retrait envoyée.'
                            : 'Publication mise dans la corbeille.'
                    );
                } else {
                    hub_web_flash('Mise en corbeille effectuée, mais un retrait manuel reste nécessaire sur au moins un réseau.', 'warn');
                }
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
        'manual_ready' => 'À publier manuellement',
        'partially_published' => 'Partiellement en ligne',
        'publish_failed' => 'Échec publication',
        'trashed' => 'Corbeille',
        'trash_partial' => 'Retrait incomplet',
        default => ucfirst($status ?: 'Inconnu'),
    };
}

function hub_type_label(string $type): string
{
    return match ($type) {
        'reel' => 'Reel',
        'story' => 'Story',
        default => 'Publication',
    };
}

function hub_render_publication(array $item, array $config, string $csrf, bool $canAct): void
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
    $contentType = hub_valid_content_type((string)($item['content_type'] ?? 'post')) ?: 'post';
    $accountKey = (string)($item['account'] ?? 'pro');
    $isTrash = in_array($state, ['trashed', 'trash_partial'], true);
    $manual = (array)($item['manual'] ?? []);
    $errors = (array)($item['errors'] ?? []);
    ?>
    <article class="pub-row">
      <div class="thumb">
        <?php if ($media !== ''): ?>
          <?php if (preg_match('/\.(mp4|mov)(?:\?|$)/i', $media)): ?>
            <video src="<?= hub_escape($media) ?>" muted playsinline preload="metadata"></video>
          <?php else: ?>
            <img src="<?= hub_escape($media) ?>" alt="">
          <?php endif; ?>
        <?php else: ?>
          <div class="thumb-empty" aria-hidden="true">SP</div>
        <?php endif; ?>
      </div>
      <div class="pub-main">
        <div class="pub-top">
          <div>
            <div class="kicker"><?= hub_escape(hub_type_label($contentType)) ?> · <?= hub_escape(hub_account_label($config, $accountKey)) ?></div>
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
            <?php foreach ($manual as $platform => $reason): ?>
              <span class="manual"><?= hub_escape(ucfirst((string)$platform)) ?> : manuel</span>
            <?php endforeach; ?>
            <?php foreach ($errors as $platform => $reason): ?>
              <span class="error"><?= hub_escape(ucfirst((string)$platform)) ?> : échec</span>
            <?php endforeach; ?>
          </div>
          <?php if (!$isTrash): ?>
            <div class="actions">
              <?php if ($state === 'draft'): ?>
                <form method="post">
                  <input type="hidden" name="csrf" value="<?= hub_escape($csrf) ?>">
                  <input type="hidden" name="action" value="approve">
                  <input type="hidden" name="id" value="<?= hub_escape($id) ?>">
                  <button type="submit" class="primary" <?= $canAct ? '' : 'disabled' ?>>Approuver</button>
                </form>
              <?php elseif ($state === 'approved'): ?>
                <form method="post" class="publish-form">
                  <input type="hidden" name="csrf" value="<?= hub_escape($csrf) ?>">
                  <input type="hidden" name="action" value="publish">
                  <input type="hidden" name="id" value="<?= hub_escape($id) ?>">
                  <button type="submit" class="primary" <?= $canAct ? '' : 'disabled' ?> data-title="<?= hub_escape($title) ?>">Publier</button>
                </form>
              <?php elseif (in_array($state, ['manual_ready', 'partially_published', 'publish_failed'], true)): ?>
                <form method="post">
                  <input type="hidden" name="csrf" value="<?= hub_escape($csrf) ?>">
                  <input type="hidden" name="action" value="mark_published">
                  <input type="hidden" name="id" value="<?= hub_escape($id) ?>">
                  <button type="submit" class="secondary" <?= $canAct ? '' : 'disabled' ?>>Marquer publié</button>
                </form>
              <?php endif; ?>
              <form method="post" class="trash-form">
                <input type="hidden" name="csrf" value="<?= hub_escape($csrf) ?>">
                <input type="hidden" name="action" value="trash">
                <input type="hidden" name="id" value="<?= hub_escape($id) ?>">
                <button type="submit" class="trash-btn" <?= $canAct ? '' : 'disabled' ?> data-title="<?= hub_escape($title) ?>">Corbeille</button>
              </form>
            </div>
          <?php endif; ?>
        </div>
        <?php if ($manual !== [] || $errors !== []): ?>
          <details class="details">
            <summary>Détails de diffusion</summary>
            <?php foreach ($manual as $platform => $reason): ?>
              <p><strong><?= hub_escape(ucfirst((string)$platform)) ?> :</strong> <?= hub_escape((string)$reason) ?></p>
            <?php endforeach; ?>
            <?php foreach ($errors as $platform => $reason): ?>
              <p><strong><?= hub_escape(ucfirst((string)$platform)) ?> :</strong> <?= hub_escape((string)$reason) ?></p>
            <?php endforeach; ?>
          </details>
        <?php endif; ?>
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
    *{box-sizing:border-box}body{margin:0}.wrap{max-width:1120px;margin:0 auto;padding:34px 18px 70px}
    .hero,.composer{background:#fff;border:1px solid #e5e9ef;border-radius:22px;padding:26px}.composer{margin-top:18px}
    .eyebrow,.kicker{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#7a8594}.hero h1{font-size:31px;margin:5px 0 7px}.hero p,.composer p{margin:0;color:#5f6c7c;line-height:1.55}
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}.metric{padding:16px;border:1px solid #e6eaf0;border-radius:15px;background:#fafbfc}.metric b{display:block;margin-top:4px;font-size:17px}.ok{color:#177254}.wait{color:#9a6716}
    .account-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.account-card{padding:14px;border:1px solid #e5e9ef;border-radius:14px;background:#fafbfc}.account-card strong{display:block}.account-state{margin-top:6px;font-size:13px;color:#667487}
    .flash{margin:18px 0 0;padding:13px 15px;border-radius:13px;background:#edf7f2;color:#185f47}.flash.warn{background:#fff5df;color:#7f5711}
    .composer h2,.section h2{font-size:21px;margin:0 0 4px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}.field{min-width:0}.field.full{grid-column:1/-1}.field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}.field input[type=text],.field input[type=url],.field select,.field textarea,.field input[type=file]{width:100%;font:inherit;border:1px solid #d8dee7;border-radius:11px;padding:11px 12px;background:#fff}.field textarea{min-height:120px;resize:vertical}.check-row{display:flex;gap:18px;flex-wrap:wrap;align-items:center}.check{display:flex;gap:7px;align-items:center;font-size:14px}.hint{font-size:12px;color:#788495;margin-top:5px;line-height:1.4}
    .preview{display:none;margin-top:14px;padding:12px;border:1px solid #e3e7ed;border-radius:14px;background:#fafbfc}.preview img,.preview video{display:block;max-width:260px;max-height:320px;border-radius:11px;object-fit:cover}
    button{font:inherit}.primary,.secondary,.trash-btn{border-radius:11px;padding:9px 12px;font-weight:700;cursor:pointer}.primary{border:1px solid #244b7c;background:#244b7c;color:white}.secondary{border:1px solid #cdd6e2;background:#f7f9fb;color:#31445c}.trash-btn{border:1px solid #e2c9c9;background:#fff7f7;color:#8a3535}.primary:disabled,.secondary:disabled,.trash-btn:disabled{opacity:.45;cursor:not-allowed}.composer .primary{padding:11px 16px}
    .section{margin-top:28px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:12px}.section h2{margin:0}.count{font-size:13px;color:#748092}
    .pub-list{display:grid;gap:10px}.pub-row{display:grid;grid-template-columns:116px minmax(0,1fr);gap:16px;padding:13px;background:#fff;border:1px solid #e4e8ee;border-radius:17px}.thumb{width:116px;height:92px;border-radius:12px;overflow:hidden;background:#edf0f4}.thumb img,.thumb video{width:100%;height:100%;object-fit:cover}.thumb-empty{width:100%;height:100%;display:grid;place-items:center;font-weight:800;color:#8b95a4;font-size:20px}
    .pub-main{min-width:0}.pub-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.pub-top h3{font-size:17px;margin:3px 0 4px;line-height:1.3}.meta{font-size:13px;color:#7a8594}.excerpt{font-size:14px;line-height:1.45;color:#536173;margin:9px 0 12px}.pub-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.platforms,.actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.actions form{margin:0}.platform,.manual,.error,.status{font-size:12px;border-radius:999px;padding:5px 9px;background:#f0f3f6;color:#536173}.status-published{background:#e9f6ef;color:#176a4e}.status-approved{background:#eef2ff;color:#4557a6}.status-manual_ready,.status-partially_published{background:#fff5df;color:#835e17}.status-publish_failed,.status-trash_partial{background:#fff0e7;color:#9a4d22}.status-trashed{background:#eceff3;color:#606b78}.manual{background:#fff5df;color:#835e17}.error{background:#fff0e7;color:#9a4d22}
    .details{margin-top:10px;font-size:13px;color:#5d6979}.details p{margin:6px 0}.empty{padding:25px;text-align:center;border:1px dashed #d8dee7;border-radius:16px;color:#7a8594;background:#fafbfc}.note{margin-top:14px;font-size:13px;line-height:1.5;color:#667487}.foot{margin-top:30px;color:#7b8796;font-size:13px}
    @media(max-width:760px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.account-grid,.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.pub-row{grid-template-columns:88px minmax(0,1fr)}.thumb{width:88px;height:78px}.pub-top{display:block}.status{display:inline-block;margin-top:7px}}
    @media(max-width:430px){.wrap{padding:20px 12px 50px}.hero,.composer{padding:20px}.pub-row{grid-template-columns:1fr}.thumb{width:100%;height:170px}.pub-bottom{align-items:stretch}.actions,.actions form,.actions button{width:100%}}
  </style>
</head>
<body>
<main class="wrap">
  <section class="hero">
    <div class="eyebrow">Clinique SourirePlus</div>
    <h1>Social Hub</h1>
    <p>Prépare, approuve et diffuse Publications, Reels et Stories sur plusieurs comptes. Rien n’est envoyé sans validation explicite.</p>

    <div class="grid">
      <div class="metric"><span class="eyebrow">API</span><b class="<?= $apiConfigured ? 'ok' : 'wait' ?>"><?= $apiConfigured ? 'Configurée' : 'À configurer' ?></b></div>
      <div class="metric"><span class="eyebrow">Actifs</span><b><?= count($active) ?></b></div>
      <div class="metric"><span class="eyebrow">Corbeille</span><b><?= count($trash) ?></b></div>
      <div class="metric"><span class="eyebrow">Meta Graph</span><b><?= hub_escape((string)($config['graph_version'] ?? 'v26.0')) ?></b></div>
    </div>

    <div class="account-grid">
      <?php foreach ($accounts as $key => $account): if (!is_array($account)) continue; ?>
        <div class="account-card">
          <strong><?= hub_escape(hub_account_label($config, (string)$key)) ?></strong>
          <div class="account-state">
            Facebook : <span class="<?= hub_account_ready($account, 'facebook') ? 'ok' : 'wait' ?>"><?= hub_account_ready($account, 'facebook') ? 'connecté' : 'manuel / non connecté' ?></span>
            · Instagram : <span class="<?= hub_account_ready($account, 'instagram') ? 'ok' : 'wait' ?>"><?= hub_account_ready($account, 'instagram') ? 'connecté' : 'manuel / non connecté' ?></span>
          </div>
        </div>
      <?php endforeach; ?>
    </div>

    <?php if ($flash !== ''): ?>
      <div class="flash <?= $flashType === 'warn' ? 'warn' : '' ?>"><?= hub_escape($flash) ?></div>
    <?php endif; ?>

    <div class="note">Un compte non accessible par l’API reste utilisable dans le planning : le Hub prépare le contenu, puis le marque « à publier manuellement ».</div>
  </section>

  <section class="composer">
    <div class="eyebrow">Nouveau contenu</div>
    <h2>Créer un brouillon</h2>
    <p>Tu peux aussi laisser ChatGPT créer ce brouillon plus tard via l’API du Hub.</p>

    <form method="post" enctype="multipart/form-data" id="create-form">
      <input type="hidden" name="csrf" value="<?= hub_escape($csrf) ?>">
      <input type="hidden" name="action" value="create">
      <div class="form-grid">
        <div class="field">
          <label for="content_type">Format</label>
          <select name="content_type" id="content_type">
            <option value="post">Publication</option>
            <option value="reel">Reel</option>
            <option value="story">Story</option>
          </select>
        </div>
        <div class="field">
          <label for="account">Compte</label>
          <select name="account" id="account">
            <?php foreach ($accounts as $key => $account): ?>
              <option value="<?= hub_escape((string)$key) ?>"><?= hub_escape(hub_account_label($config, (string)$key)) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="field full">
          <label>Réseaux</label>
          <div class="check-row">
            <label class="check"><input type="checkbox" name="platforms[]" value="instagram" checked> Instagram</label>
            <label class="check" id="facebook-check"><input type="checkbox" name="platforms[]" value="facebook" checked> Facebook</label>
            <label class="check" id="share-feed-wrap"><input type="checkbox" name="share_to_feed" checked> Afficher aussi le Reel dans le fil Instagram</label>
          </div>
          <div class="hint" id="format-hint">Publication : texte et éventuellement image.</div>
        </div>
        <div class="field full">
          <label for="title">Titre interne</label>
          <input type="text" name="title" id="title" maxlength="140" placeholder="Ex. Le scan 3D sans empreinte">
        </div>
        <div class="field full">
          <label for="caption">Texte / légende</label>
          <textarea name="caption" id="caption" maxlength="5000" required placeholder="Le texte qui accompagnera la publication…"></textarea>
        </div>
        <div class="field">
          <label for="media">Image ou vidéo</label>
          <input type="file" name="media" id="media" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime">
          <div class="hint">Pour Reel : MP4/MOV. Pour Story : image ou vidéo verticale recommandée.</div>
        </div>
        <div class="field">
          <label for="media_url">Ou URL publique du média</label>
          <input type="url" name="media_url" id="media_url" placeholder="https://…">
          <div class="hint">Utile si le média est déjà hébergé ailleurs.</div>
        </div>
      </div>
      <div class="preview" id="media-preview"></div>
      <div style="margin-top:16px"><button type="submit" class="primary" <?= $apiConfigured ? '' : 'disabled' ?>>Créer le brouillon</button></div>
    </form>
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
        <?php foreach ($active as $item) hub_render_publication($item, $config, $csrf, $apiConfigured); ?>
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
        <?php foreach ($trash as $item) hub_render_publication($item, $config, $csrf, false); ?>
      <?php endif; ?>
    </div>
  </section>

  <div class="foot">Publication → approbation → envoi. Les comptes personnels non pris en charge par Meta restent en mode manuel, sans bloquer la préparation du contenu.</div>
</main>
<script>
(() => {
  const type = document.getElementById('content_type');
  const hint = document.getElementById('format-hint');
  const fbWrap = document.getElementById('facebook-check');
  const fb = fbWrap?.querySelector('input');
  const shareWrap = document.getElementById('share-feed-wrap');
  const media = document.getElementById('media');
  const preview = document.getElementById('media-preview');

  const updateType = () => {
    const value = type?.value || 'post';
    if (value === 'post') {
      hint.textContent = 'Publication : texte et éventuellement image.';
      shareWrap.style.display = 'none';
      if (fb) fb.disabled = false;
      fbWrap.style.opacity = '1';
    } else if (value === 'reel') {
      hint.textContent = 'Reel : vidéo requise. Instagram et Facebook Pages peuvent être automatisés quand les comptes sont connectés.';
      shareWrap.style.display = 'flex';
      if (fb) fb.disabled = false;
      fbWrap.style.opacity = '1';
    } else {
      hint.textContent = 'Story : image ou vidéo requise. Instagram Business peut être automatisé ; Facebook reste manuel dans cette version.';
      shareWrap.style.display = 'none';
      if (fb) fb.disabled = false;
      fbWrap.style.opacity = '.75';
    }
  };
  type?.addEventListener('change', updateType);
  updateType();

  media?.addEventListener('change', () => {
    preview.innerHTML = '';
    const file = media.files?.[0];
    if (!file) {
      preview.style.display = 'none';
      return;
    }
    const url = URL.createObjectURL(file);
    const node = document.createElement(file.type.startsWith('video/') ? 'video' : 'img');
    node.src = url;
    if (node.tagName === 'VIDEO') {
      node.controls = true;
      node.muted = true;
      node.playsInline = true;
    }
    node.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    node.addEventListener('loadeddata', () => URL.revokeObjectURL(url), { once: true });
    preview.appendChild(node);
    preview.style.display = 'block';
  });

  document.querySelectorAll('.trash-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const button = form.querySelector('.trash-btn');
      const title = button?.dataset.title || 'cette publication';
      if (!window.confirm('Mettre « ' + title + ' » dans la corbeille ? Si elle est en ligne, le Hub tentera aussi de la retirer du réseau.')) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll('.publish-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const button = form.querySelector('.primary');
      const title = button?.dataset.title || 'cette publication';
      if (!window.confirm('Publier maintenant « ' + title + ' » sur les réseaux sélectionnés ?')) {
        event.preventDefault();
      }
    });
  });
})();
</script>
</body>
</html>
