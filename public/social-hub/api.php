<?php
declare(strict_types=1);

require __DIR__ . '/lib.php';

$config = hub_config();
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$action = strtolower(trim((string)($_GET['action'] ?? 'status')));

if ($method === 'OPTIONS') {
    header('Allow: GET, POST, OPTIONS');
    http_response_code(204);
    exit;
}

if ($method === 'GET' && $action === 'status') {
    $accountStatus = [];
    foreach (hub_accounts($config) as $key => $account) {
        if (!is_array($account)) {
            continue;
        }
        $accountStatus[$key] = [
            'label' => (string)($account['label'] ?? ucfirst((string)$key)),
            'kind' => (string)($account['kind'] ?? ''),
            'facebook' => hub_account_ready($account, 'facebook'),
            'instagram' => hub_account_ready($account, 'instagram'),
            'instagram_account_type' => (string)($account['instagram_account_type'] ?? ''),
        ];
    }

    hub_json_response([
        'ok' => true,
        'service' => 'SourirePlus Social Hub',
        'version' => '1.2.0',
        'graph_version' => (string)($config['graph_version'] ?? 'v26.0'),
        'configured' => [
            'api_key' => (string)($config['api_key'] ?? '') !== '',
            'accounts' => $accountStatus,
        ],
        'content_types' => ['post', 'reel', 'story'],
        'platforms' => ['facebook', 'instagram'],
        'safety' => [
            'draft_required' => true,
            'approval_required' => true,
            'publish_confirmation_required' => true,
            'trash_confirmation_required' => true,
        ],
    ]);
}

hub_authenticate($config);

if ($method === 'GET' && in_array($action, ['drafts', 'publications'], true)) {
    $items = hub_load_drafts();
    usort($items, static function (array $a, array $b): int {
        $aDate = (string)($a['published_at'] ?? $a['created_at'] ?? '');
        $bDate = (string)($b['published_at'] ?? $b['created_at'] ?? '');
        return strcmp($bDate, $aDate);
    });
    hub_json_response(['ok' => true, 'publications' => $items, 'drafts' => $items]);
}

if ($method !== 'POST') {
    hub_json_response(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

$body = hub_read_json_body();

if ($action === 'draft') {
    $caption = trim((string)($body['caption'] ?? ''));
    if ($caption === '' || mb_strlen($caption) > 5000) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_CAPTION'], 422);
    }

    $platforms = hub_valid_platforms($body['platforms'] ?? []);
    if ($platforms === []) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_PLATFORMS'], 422);
    }

    $contentType = hub_valid_content_type((string)($body['content_type'] ?? 'post'));
    if ($contentType === '') {
        hub_json_response(['ok' => false, 'error' => 'INVALID_CONTENT_TYPE'], 422);
    }

    $accountKey = trim((string)($body['account'] ?? 'pro'));
    if (hub_account($config, $accountKey) === []) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_ACCOUNT'], 422);
    }

    $mediaUrl = trim((string)($body['media_url'] ?? ''));
    if ($mediaUrl !== '' && filter_var($mediaUrl, FILTER_VALIDATE_URL) === false) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_MEDIA_URL'], 422);
    }
    if (in_array($contentType, ['reel', 'story'], true) && $mediaUrl === '') {
        hub_json_response(['ok' => false, 'error' => 'MEDIA_REQUIRED'], 422);
    }

    $title = trim((string)($body['title'] ?? ''));
    if ($title === '') {
        $title = hub_derive_title($caption);
    }
    if (mb_strlen($title) > 140) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_TITLE'], 422);
    }

    $drafts = hub_load_drafts();
    $draft = [
        'id' => bin2hex(random_bytes(8)),
        'title' => $title,
        'caption' => $caption,
        'content_type' => $contentType,
        'account' => $accountKey,
        'platforms' => $platforms,
        'media_url' => $mediaUrl,
        'share_to_feed' => !array_key_exists('share_to_feed', $body) || (bool)$body['share_to_feed'],
        'status' => 'draft',
        'created_at' => gmdate('c'),
        'approved_at' => null,
        'published_at' => null,
        'trashed_at' => null,
        'results' => [],
    ];
    $drafts[] = $draft;
    hub_save_drafts($drafts);
    hub_json_response(['ok' => true, 'draft' => $draft], 201);
}

if ($action === 'approve') {
    $id = trim((string)($body['id'] ?? ''));
    if ((string)($body['approval'] ?? '') !== 'APPROVE') {
        hub_json_response(['ok' => false, 'error' => 'EXPLICIT_APPROVAL_REQUIRED'], 409);
    }
    $drafts = hub_load_drafts();
    $index = hub_find_draft_index($drafts, $id);
    if ($index < 0) {
        hub_json_response(['ok' => false, 'error' => 'DRAFT_NOT_FOUND'], 404);
    }
    if (in_array((string)($drafts[$index]['status'] ?? ''), ['published', 'trashed', 'trash_partial'], true)) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_STATUS_FOR_APPROVAL'], 409);
    }
    $drafts[$index]['status'] = 'approved';
    $drafts[$index]['approved_at'] = gmdate('c');
    hub_save_drafts($drafts);
    hub_json_response(['ok' => true, 'draft' => $drafts[$index]]);
}

if ($action === 'publish') {
    $id = trim((string)($body['id'] ?? ''));
    if ((string)($body['confirmation'] ?? '') !== 'PUBLISH') {
        hub_json_response(['ok' => false, 'error' => 'EXPLICIT_PUBLISH_CONFIRMATION_REQUIRED'], 409);
    }
    $drafts = hub_load_drafts();
    $index = hub_find_draft_index($drafts, $id);
    if ($index < 0) {
        hub_json_response(['ok' => false, 'error' => 'DRAFT_NOT_FOUND'], 404);
    }
    if (($drafts[$index]['status'] ?? '') !== 'approved') {
        hub_json_response(['ok' => false, 'error' => 'APPROVAL_REQUIRED'], 409);
    }

    try {
        $publication = hub_publish_draft($config, $drafts[$index]);
    } catch (Throwable $exception) {
        hub_json_response([
            'ok' => false,
            'error' => 'PUBLISH_FAILED',
            'message' => $exception->getMessage(),
        ], 502);
    }

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

    hub_save_drafts($drafts);

    hub_json_response([
        'ok' => $errors === [],
        'manual_action_required' => $manual !== [],
        'draft' => $drafts[$index],
    ], $errors === [] ? 200 : 207);
}

if ($action === 'mark_published') {
    $id = trim((string)($body['id'] ?? ''));
    if ((string)($body['confirmation'] ?? '') !== 'MARK_PUBLISHED') {
        hub_json_response(['ok' => false, 'error' => 'EXPLICIT_CONFIRMATION_REQUIRED'], 409);
    }
    $drafts = hub_load_drafts();
    $index = hub_find_draft_index($drafts, $id);
    if ($index < 0) {
        hub_json_response(['ok' => false, 'error' => 'DRAFT_NOT_FOUND'], 404);
    }
    if (!in_array((string)($drafts[$index]['status'] ?? ''), ['manual_ready', 'partially_published', 'publish_failed'], true)) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_STATUS'], 409);
    }
    $drafts[$index]['status'] = 'published';
    $drafts[$index]['published_at'] = gmdate('c');
    $drafts[$index]['manual_marked_published'] = true;
    hub_save_drafts($drafts);
    hub_json_response(['ok' => true, 'draft' => $drafts[$index]]);
}

if ($action === 'trash') {
    $id = trim((string)($body['id'] ?? ''));
    if ((string)($body['confirmation'] ?? '') !== 'TRASH') {
        hub_json_response(['ok' => false, 'error' => 'EXPLICIT_TRASH_CONFIRMATION_REQUIRED'], 409);
    }

    $drafts = hub_load_drafts();
    $index = hub_find_draft_index($drafts, $id);
    if ($index < 0) {
        hub_json_response(['ok' => false, 'error' => 'DRAFT_NOT_FOUND'], 404);
    }
    if (in_array((string)($drafts[$index]['status'] ?? ''), ['trashed', 'trash_partial'], true)) {
        hub_json_response(['ok' => false, 'error' => 'ALREADY_TRASHED'], 409);
    }

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

    hub_json_response([
        'ok' => $failed === [],
        'draft' => $drafts[$index],
        'manual_action_required' => $failed !== [],
    ], $failed === [] ? 200 : 207);
}

if ($action === 'upload') {
    $filename = trim((string)($body['filename'] ?? 'asset'));
    $data = (string)($body['base64'] ?? '');
    if ($data === '') {
        hub_json_response(['ok' => false, 'error' => 'MISSING_BASE64'], 422);
    }
    if (str_contains($data, ',')) {
        $parts = explode(',', $data, 2);
        $data = $parts[1] ?? '';
    }
    $binary = base64_decode($data, true);
    if ($binary === false || strlen($binary) === 0 || strlen($binary) > 12 * 1024 * 1024) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_MEDIA_SIZE'], 422);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->buffer($binary);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'video/mp4' => 'mp4',
        'video/quicktime' => 'mov',
    ];
    if (!isset($extensions[$mime])) {
        hub_json_response(['ok' => false, 'error' => 'UNSUPPORTED_MEDIA_TYPE'], 422);
    }
    $safeStem = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($filename, PATHINFO_FILENAME));
    $safeStem = trim((string)$safeStem, '-_');
    if ($safeStem === '') {
        $safeStem = 'asset';
    }
    $storedName = $safeStem . '-' . bin2hex(random_bytes(6)) . '.' . $extensions[$mime];
    $target = hub_media_dir() . '/' . $storedName;
    if (file_put_contents($target, $binary, LOCK_EX) === false) {
        hub_json_response(['ok' => false, 'error' => 'MEDIA_WRITE_FAILED'], 500);
    }
    $base = rtrim((string)($config['public_base_url'] ?? 'https://sourireplus.ch/social-hub'), '/');
    hub_json_response([
        'ok' => true,
        'media_url' => $base . '/media/' . rawurlencode($storedName),
        'mime_type' => $mime,
        'size' => strlen($binary),
    ], 201);
}

hub_json_response(['ok' => false, 'error' => 'UNKNOWN_ACTION'], 404);
