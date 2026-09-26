<?php
declare(strict_types=1);

function hub_json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function hub_config(): array
{
    $path = dirname(__DIR__) . '/config/social-hub.php';
    if (!is_file($path)) {
        return [
            'api_key' => '',
            'graph_version' => 'v26.0',
            'public_base_url' => 'https://sourireplus.ch/social-hub',
            'accounts' => [
                'pro' => [
                    'label' => 'Compte pro',
                    'kind' => 'professional',
                    'page_id' => '',
                    'page_access_token' => '',
                    'instagram_user_id' => '',
                    'instagram_account_type' => '',
                ],
                'private' => [
                    'label' => 'Compte privé',
                    'kind' => 'personal',
                    'page_id' => '',
                    'page_access_token' => '',
                    'instagram_user_id' => '',
                    'instagram_account_type' => '',
                ],
            ],
        ];
    }

    $config = require $path;
    return is_array($config) ? $config : [];
}

function hub_accounts(array $config): array
{
    $accounts = $config['accounts'] ?? null;
    if (is_array($accounts) && $accounts !== []) {
        return $accounts;
    }

    return [
        'pro' => [
            'label' => 'Compte pro',
            'kind' => 'professional',
            'page_id' => (string)($config['page_id'] ?? ''),
            'page_access_token' => (string)($config['page_access_token'] ?? ''),
            'instagram_user_id' => (string)($config['instagram_user_id'] ?? ''),
            'instagram_account_type' => '',
        ],
        'private' => [
            'label' => 'Compte privé',
            'kind' => 'personal',
            'page_id' => '',
            'page_access_token' => '',
            'instagram_user_id' => '',
            'instagram_account_type' => '',
        ],
    ];
}

function hub_account(array $config, string $key): array
{
    $accounts = hub_accounts($config);
    if (!isset($accounts[$key]) || !is_array($accounts[$key])) {
        return [];
    }
    return $accounts[$key];
}

function hub_account_label(array $config, string $key): string
{
    $account = hub_account($config, $key);
    $label = trim((string)($account['label'] ?? ''));
    return $label !== '' ? $label : ucfirst($key);
}

function hub_account_ready(array $account, string $platform): bool
{
    $token = (string)($account['page_access_token'] ?? '');
    if ($platform === 'facebook') {
        return (string)($account['page_id'] ?? '') !== '' && $token !== '';
    }
    if ($platform === 'instagram') {
        return (string)($account['instagram_user_id'] ?? '') !== '' && $token !== '';
    }
    return false;
}

function hub_authenticate(array $config): void
{
    $expected = (string)($config['api_key'] ?? '');
    if ($expected === '') {
        hub_json_response([
            'ok' => false,
            'error' => 'SOCIAL_HUB_NOT_CONFIGURED',
            'message' => 'The Social Hub API key is not configured yet.',
        ], 503);
    }

    $header = (string)($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        hub_json_response(['ok' => false, 'error' => 'UNAUTHORIZED'], 401);
    }

    $provided = trim($matches[1]);
    if ($provided === '' || !hash_equals($expected, $provided)) {
        hub_json_response(['ok' => false, 'error' => 'UNAUTHORIZED'], 401);
    }
}

function hub_require_admin(array $config): void
{
    $expected = (string)($config['api_key'] ?? '');
    if ($expected === '') {
        return;
    }

    $provided = (string)($_SERVER['PHP_AUTH_PW'] ?? '');
    if ($provided === '' || !hash_equals($expected, $provided)) {
        header('WWW-Authenticate: Basic realm="SourirePlus Social Hub"');
        http_response_code(401);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Accès réservé au Social Hub.";
        exit;
    }
}

function hub_csrf_token(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Strict',
            'cookie_secure' => true,
            'use_strict_mode' => true,
        ]);
    }
    if (!isset($_SESSION['social_hub_csrf']) || !is_string($_SESSION['social_hub_csrf'])) {
        $_SESSION['social_hub_csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['social_hub_csrf'];
}

function hub_validate_csrf(string $token): bool
{
    $expected = hub_csrf_token();
    return $token !== '' && hash_equals($expected, $token);
}

function hub_read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        hub_json_response(['ok' => false, 'error' => 'INVALID_JSON'], 400);
    }
    return $data;
}

function hub_data_dir(): string
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0770, true) && !is_dir($dir)) {
        hub_json_response(['ok' => false, 'error' => 'STORAGE_UNAVAILABLE'], 500);
    }
    return $dir;
}

function hub_media_dir(): string
{
    $dir = __DIR__ . '/media';
    if (!is_dir($dir) && !mkdir($dir, 0770, true) && !is_dir($dir)) {
        hub_json_response(['ok' => false, 'error' => 'MEDIA_STORAGE_UNAVAILABLE'], 500);
    }
    return $dir;
}

function hub_drafts_path(): string
{
    return hub_data_dir() . '/drafts.json';
}

function hub_load_drafts(): array
{
    $path = hub_drafts_path();
    if (!is_file($path)) {
        return [];
    }
    $handle = fopen($path, 'rb');
    if ($handle === false) {
        return [];
    }
    flock($handle, LOCK_SH);
    $raw = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    $data = json_decode((string)$raw, true);
    return is_array($data) ? $data : [];
}

function hub_save_drafts(array $drafts): void
{
    $path = hub_drafts_path();
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        hub_json_response(['ok' => false, 'error' => 'STORAGE_UNAVAILABLE'], 500);
    }
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        hub_json_response(['ok' => false, 'error' => 'STORAGE_LOCK_FAILED'], 500);
    }
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($drafts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

function hub_find_draft_index(array $drafts, string $id): int
{
    foreach ($drafts as $index => $draft) {
        if (is_array($draft) && (string)($draft['id'] ?? '') === $id) {
            return (int)$index;
        }
    }
    return -1;
}

function hub_valid_platforms(mixed $platforms): array
{
    if (!is_array($platforms)) {
        return [];
    }
    $allowed = ['facebook', 'instagram'];
    $clean = [];
    foreach ($platforms as $platform) {
        $value = strtolower(trim((string)$platform));
        if (in_array($value, $allowed, true) && !in_array($value, $clean, true)) {
            $clean[] = $value;
        }
    }
    return $clean;
}

function hub_valid_content_type(string $value): string
{
    $value = strtolower(trim($value));
    return in_array($value, ['post', 'reel', 'story'], true) ? $value : '';
}

function hub_derive_title(string $caption): string
{
    $plain = trim(preg_replace('/\s+/u', ' ', strip_tags($caption)) ?? '');
    if ($plain === '') {
        return 'Publication sans titre';
    }
    if (function_exists('mb_substr')) {
        $title = mb_substr($plain, 0, 72);
        return mb_strlen($plain) > 72 ? rtrim($title) . '…' : $title;
    }
    $title = substr($plain, 0, 72);
    return strlen($plain) > 72 ? rtrim($title) . '…' : $title;
}

function hub_store_uploaded_media(array $file, array $config): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return '';
    }
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Échec de l’envoi du média.');
    }
    $tmp = (string)($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        throw new RuntimeException('Média envoyé invalide.');
    }
    $size = (int)($file['size'] ?? 0);
    if ($size <= 0 || $size > 300 * 1024 * 1024) {
        throw new RuntimeException('Le média est vide ou dépasse 300 Mo.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file($tmp);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'video/mp4' => 'mp4',
        'video/quicktime' => 'mov',
    ];
    if (!isset($extensions[$mime])) {
        throw new RuntimeException('Format média non pris en charge.');
    }

    $original = (string)($file['name'] ?? 'media');
    $safeStem = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($original, PATHINFO_FILENAME));
    $safeStem = trim((string)$safeStem, '-_');
    if ($safeStem === '') {
        $safeStem = 'media';
    }
    $storedName = $safeStem . '-' . bin2hex(random_bytes(6)) . '.' . $extensions[$mime];
    $target = hub_media_dir() . '/' . $storedName;
    if (!move_uploaded_file($tmp, $target)) {
        throw new RuntimeException('Impossible d’enregistrer le média.');
    }

    $base = rtrim((string)($config['public_base_url'] ?? 'https://sourireplus.ch/social-hub'), '/');
    return $base . '/media/' . rawurlencode($storedName);
}

function hub_graph_request(string $method, string $url, array $params = [], array $headers = []): array
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('PHP cURL extension is unavailable.');
    }

    $method = strtoupper($method);
    if ($method === 'DELETE' && $params !== []) {
        $url .= (str_contains($url, '?') ? '&' : '?') . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    }

    $ch = curl_init($url);
    if ($ch === false) {
        throw new RuntimeException('Unable to initialize cURL.');
    }

    $httpHeaders = array_merge(['Accept: application/json'], $headers);
    $options = [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_HTTPHEADER => $httpHeaders,
        CURLOPT_USERAGENT => 'SourirePlusSocialHub/1.2',
    ];
    if ($method === 'POST' && $params !== []) {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    }
    curl_setopt_array($ch, $options);

    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException('Meta request failed: ' . $error);
    }
    $decoded = json_decode((string)$raw, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Meta returned a non-JSON response.');
    }
    if ($status < 200 || $status >= 300 || isset($decoded['error'])) {
        $message = (string)($decoded['error']['message'] ?? ('HTTP ' . $status));
        throw new RuntimeException('Meta API error: ' . $message);
    }
    return $decoded;
}

function hub_graph_post(string $url, array $params): array
{
    return hub_graph_request('POST', $url, $params);
}

function hub_delete_remote_object(array $config, array $account, string $objectId): array
{
    $version = (string)($config['graph_version'] ?? 'v26.0');
    $token = (string)($account['page_access_token'] ?? '');
    if ($token === '') {
        throw new RuntimeException('Meta access token is not configured.');
    }
    if ($objectId === '') {
        throw new RuntimeException('Remote publication id is missing.');
    }

    return hub_graph_request(
        'DELETE',
        sprintf('https://graph.facebook.com/%s/%s', rawurlencode($version), rawurlencode($objectId)),
        ['access_token' => $token]
    );
}

function hub_suspend_online(array $config, array $draft): array
{
    $accountKey = (string)($draft['account'] ?? 'pro');
    $account = hub_account($config, $accountKey);
    $results = (array)($draft['results'] ?? []);
    $removal = [];

    foreach ((array)($draft['platforms'] ?? []) as $platform) {
        $platformResult = is_array($results[$platform] ?? null) ? $results[$platform] : [];
        if (($platformResult['manual'] ?? false) === true) {
            $removal[$platform] = [
                'ok' => false,
                'manual_action_required' => true,
                'error' => 'Publication gérée manuellement sur ce compte.',
            ];
            continue;
        }

        $objectId = (string)($platformResult['post_id'] ?? $platformResult['id'] ?? $platformResult['video_id'] ?? '');
        if ($objectId === '') {
            $removal[$platform] = [
                'ok' => false,
                'manual_action_required' => true,
                'error' => 'Aucun identifiant distant enregistré pour cette publication.',
            ];
            continue;
        }

        try {
            $remote = hub_delete_remote_object($config, $account, $objectId);
            $removal[$platform] = [
                'ok' => true,
                'object_id' => $objectId,
                'response' => $remote,
            ];
        } catch (Throwable $exception) {
            $removal[$platform] = [
                'ok' => false,
                'object_id' => $objectId,
                'manual_action_required' => true,
                'error' => $exception->getMessage(),
            ];
        }
    }
    return $removal;
}

function hub_publish_instagram(array $config, array $account, array $draft): array
{
    if (!hub_account_ready($account, 'instagram')) {
        return [
            'manual' => true,
            'reason' => 'Ce compte Instagram n’est pas connecté à l’API Meta.',
        ];
    }

    $version = (string)($config['graph_version'] ?? 'v26.0');
    $igUserId = (string)($account['instagram_user_id'] ?? '');
    $token = (string)($account['page_access_token'] ?? '');
    $mediaUrl = trim((string)($draft['media_url'] ?? ''));
    $caption = (string)($draft['caption'] ?? '');
    $type = hub_valid_content_type((string)($draft['content_type'] ?? 'post'));

    if ($mediaUrl === '') {
        throw new RuntimeException('Instagram nécessite un média public.');
    }

    $params = ['access_token' => $token];
    if ($type === 'post') {
        $params['image_url'] = $mediaUrl;
        $params['caption'] = $caption;
    } elseif ($type === 'reel') {
        $params['media_type'] = 'REELS';
        $params['video_url'] = $mediaUrl;
        $params['caption'] = $caption;
        $params['share_to_feed'] = !empty($draft['share_to_feed']) ? 'true' : 'false';
    } elseif ($type === 'story') {
        $accountType = strtoupper((string)($account['instagram_account_type'] ?? ''));
        if ($accountType === 'CREATOR') {
            return [
                'manual' => true,
                'reason' => 'Avec Facebook Login, les Stories API sont réservées aux comptes Instagram Business.',
            ];
        }
        $params['media_type'] = 'STORIES';
        if (preg_match('/\.(mp4|mov)(?:\?|$)/i', $mediaUrl)) {
            $params['video_url'] = $mediaUrl;
        } else {
            $params['image_url'] = $mediaUrl;
        }
    } else {
        throw new RuntimeException('Type de contenu Instagram invalide.');
    }

    $container = hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/media', rawurlencode($version), rawurlencode($igUserId)),
        $params
    );
    $creationId = (string)($container['id'] ?? '');
    if ($creationId === '') {
        throw new RuntimeException('Instagram did not return a media container id.');
    }

    $published = hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/media_publish', rawurlencode($version), rawurlencode($igUserId)),
        ['creation_id' => $creationId, 'access_token' => $token]
    );
    $published['container_id'] = $creationId;
    return $published;
}

function hub_publish_facebook_reel(array $config, array $account, array $draft): array
{
    $version = (string)($config['graph_version'] ?? 'v26.0');
    $pageId = (string)($account['page_id'] ?? '');
    $token = (string)($account['page_access_token'] ?? '');
    $mediaUrl = trim((string)($draft['media_url'] ?? ''));
    if ($mediaUrl === '') {
        throw new RuntimeException('Facebook Reel nécessite une vidéo publique.');
    }

    $start = hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/video_reels', rawurlencode($version), rawurlencode($pageId)),
        ['upload_phase' => 'start', 'access_token' => $token]
    );
    $videoId = (string)($start['video_id'] ?? '');
    $uploadUrl = (string)($start['upload_url'] ?? '');
    if ($videoId === '' || $uploadUrl === '') {
        throw new RuntimeException('Facebook n’a pas renvoyé de session d’envoi Reel.');
    }

    hub_graph_request(
        'POST',
        $uploadUrl,
        [],
        [
            'Authorization: OAuth ' . $token,
            'file_url: ' . $mediaUrl,
        ]
    );

    $finish = hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/video_reels', rawurlencode($version), rawurlencode($pageId)),
        [
            'access_token' => $token,
            'video_id' => $videoId,
            'upload_phase' => 'finish',
            'video_state' => 'PUBLISHED',
            'description' => (string)($draft['caption'] ?? ''),
            'title' => (string)($draft['title'] ?? ''),
        ]
    );
    $finish['video_id'] = $videoId;
    return $finish;
}

function hub_publish_facebook(array $config, array $account, array $draft): array
{
    if (!hub_account_ready($account, 'facebook')) {
        return [
            'manual' => true,
            'reason' => 'Ce compte Facebook n’est pas une Page connectée à l’API Meta.',
        ];
    }

    $type = hub_valid_content_type((string)($draft['content_type'] ?? 'post'));
    if ($type === 'story') {
        return [
            'manual' => true,
            'reason' => 'La Story Facebook reste en publication manuelle dans cette version.',
        ];
    }
    if ($type === 'reel') {
        return hub_publish_facebook_reel($config, $account, $draft);
    }

    $version = (string)($config['graph_version'] ?? 'v26.0');
    $pageId = (string)($account['page_id'] ?? '');
    $token = (string)($account['page_access_token'] ?? '');
    $caption = (string)($draft['caption'] ?? '');
    $mediaUrl = (string)($draft['media_url'] ?? '');

    if ($mediaUrl !== '') {
        return hub_graph_post(
            sprintf('https://graph.facebook.com/%s/%s/photos', rawurlencode($version), rawurlencode($pageId)),
            ['url' => $mediaUrl, 'caption' => $caption, 'access_token' => $token]
        );
    }

    return hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/feed', rawurlencode($version), rawurlencode($pageId)),
        ['message' => $caption, 'access_token' => $token]
    );
}

function hub_publish_draft(array $config, array $draft): array
{
    $accountKey = (string)($draft['account'] ?? 'pro');
    $account = hub_account($config, $accountKey);
    if ($account === []) {
        throw new RuntimeException('Compte social inconnu.');
    }

    $results = [];
    $errors = [];
    $manual = [];
    foreach ((array)($draft['platforms'] ?? []) as $platform) {
        try {
            if ($platform === 'facebook') {
                $result = hub_publish_facebook($config, $account, $draft);
            } elseif ($platform === 'instagram') {
                $result = hub_publish_instagram($config, $account, $draft);
            } else {
                continue;
            }
            $results[$platform] = $result;
            if (($result['manual'] ?? false) === true) {
                $manual[$platform] = (string)($result['reason'] ?? 'Publication manuelle requise.');
            }
        } catch (Throwable $exception) {
            $errors[$platform] = $exception->getMessage();
        }
    }

    return [
        'results' => $results,
        'errors' => $errors,
        'manual' => $manual,
    ];
}
