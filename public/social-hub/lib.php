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
            'page_id' => '',
            'page_access_token' => '',
            'instagram_user_id' => '',
            'public_base_url' => 'https://sourireplus.ch/social-hub',
        ];
    }

    $config = require $path;
    return is_array($config) ? $config : [];
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

function hub_graph_post(string $url, array $params): array
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('PHP cURL extension is unavailable.');
    }
    $ch = curl_init($url);
    if ($ch === false) {
        throw new RuntimeException('Unable to initialize cURL.');
    }
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($params, '', '&', PHP_QUERY_RFC3986),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_USERAGENT => 'SourirePlusSocialHub/1.0',
    ]);
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

function hub_publish_facebook(array $config, array $draft): array
{
    $version = (string)($config['graph_version'] ?? 'v26.0');
    $pageId = (string)($config['page_id'] ?? '');
    $token = (string)($config['page_access_token'] ?? '');
    if ($pageId === '' || $token === '') {
        throw new RuntimeException('Facebook Page configuration is incomplete.');
    }

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

function hub_publish_instagram(array $config, array $draft): array
{
    $version = (string)($config['graph_version'] ?? 'v26.0');
    $igUserId = (string)($config['instagram_user_id'] ?? '');
    $token = (string)($config['page_access_token'] ?? '');
    $mediaUrl = (string)($draft['media_url'] ?? '');
    if ($igUserId === '' || $token === '') {
        throw new RuntimeException('Instagram configuration is incomplete.');
    }
    if ($mediaUrl === '') {
        throw new RuntimeException('Instagram publishing requires a public media_url.');
    }

    $container = hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/media', rawurlencode($version), rawurlencode($igUserId)),
        [
            'image_url' => $mediaUrl,
            'caption' => (string)($draft['caption'] ?? ''),
            'access_token' => $token,
        ]
    );
    $creationId = (string)($container['id'] ?? '');
    if ($creationId === '') {
        throw new RuntimeException('Instagram did not return a media container id.');
    }

    return hub_graph_post(
        sprintf('https://graph.facebook.com/%s/%s/media_publish', rawurlencode($version), rawurlencode($igUserId)),
        ['creation_id' => $creationId, 'access_token' => $token]
    );
}
