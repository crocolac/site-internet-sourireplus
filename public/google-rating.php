<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300, stale-while-revalidate=3600');
header('X-Content-Type-Options: nosniff');

const GOOGLE_CACHE_TTL_SECONDS = 3600;

function normalizeRatingPayload($payload): ?array
{
    if (!is_array($payload)) {
        return null;
    }

    $rating = $payload['rating'] ?? null;
    $reviewCount = $payload['reviewCount'] ?? $payload['userRatingCount'] ?? null;
    if (!is_numeric($rating) || !is_numeric($reviewCount)) {
        return null;
    }

    $rating = (float)$rating;
    $reviewCount = (int)$reviewCount;
    if ($rating < 0 || $rating > 5 || $reviewCount < 0) {
        return null;
    }

    return [
        'rating' => round($rating, 1),
        'reviewCount' => $reviewCount,
    ];
}

function readRatingCache(string $path): ?array
{
    if (!is_file($path)) {
        return null;
    }

    $body = @file_get_contents($path);
    $payload = is_string($body) ? json_decode($body, true) : null;
    $rating = normalizeRatingPayload($payload);
    $updatedAt = is_array($payload) ? ($payload['updatedAt'] ?? null) : null;
    if ($rating === null || !is_int($updatedAt) || $updatedAt <= 0) {
        return null;
    }

    return array_merge($rating, ['updatedAt' => $updatedAt]);
}

function sendRating(array $rating): void
{
    echo json_encode([
        'rating' => $rating['rating'],
        'reviewCount' => $rating['reviewCount'],
    ], JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['ok' => false]);
    exit;
}

$configPath = __DIR__ . '/config/google-places.php';
if (!is_file($configPath)) {
    http_response_code(503);
    echo json_encode(['ok' => false]);
    exit;
}

$config = require $configPath;
$apiKey = is_array($config) ? trim((string)($config['api_key'] ?? '')) : '';
if ($apiKey === '') {
    http_response_code(503);
    echo json_encode(['ok' => false]);
    exit;
}

$placeId = 'ChIJCUVLYRgKjkcRZphhNDOn-4I';
$cachePath = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR)
    . DIRECTORY_SEPARATOR
    . 'sourireplus-google-rating-'
    . hash('sha256', $placeId)
    . '.json';
$cachedRating = readRatingCache($cachePath);
if ($cachedRating !== null && time() - $cachedRating['updatedAt'] < GOOGLE_CACHE_TTL_SECONDS) {
    sendRating($cachedRating);
}

$endpoint = 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId);
$headers = [
    'Accept: application/json',
    'X-Goog-Api-Key: ' . $apiKey,
    'X-Goog-FieldMask: rating,userRatingCount',
];

$body = false;
$status = 0;

if (function_exists('curl_init')) {
    $request = curl_init($endpoint);
    if ($request !== false) {
        curl_setopt_array($request, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_HTTPHEADER => $headers,
        ]);
        $body = curl_exec($request);
        $status = (int)curl_getinfo($request, CURLINFO_RESPONSE_CODE);
        curl_close($request);
    }
}

$payload = is_string($body) && $status === 200 ? json_decode($body, true) : null;
$freshRating = normalizeRatingPayload($payload);
if ($freshRating !== null) {
    $cachePayload = array_merge($freshRating, ['updatedAt' => time()]);
    $temporaryPath = $cachePath . '.' . bin2hex(random_bytes(6)) . '.tmp';
    $encodedCache = json_encode($cachePayload, JSON_UNESCAPED_SLASHES);
    if (is_string($encodedCache) && @file_put_contents($temporaryPath, $encodedCache, LOCK_EX) !== false) {
        @chmod($temporaryPath, 0600);
        if (!@rename($temporaryPath, $cachePath)) {
            @unlink($temporaryPath);
        }
    }
    sendRating($freshRating);
}

// Une dernière valeur valide reste disponible pendant une panne temporaire de Google.
if ($cachedRating !== null) {
    header('Warning: 110 - "Response is stale"');
    sendRating($cachedRating);
}

http_response_code(502);
echo json_encode(['ok' => false]);
