<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

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

if (!is_string($body) || $status !== 200) {
    http_response_code(502);
    echo json_encode(['ok' => false]);
    exit;
}

$payload = json_decode($body, true);
$rating = is_array($payload) ? ($payload['rating'] ?? null) : null;
$reviewCount = is_array($payload) ? ($payload['userRatingCount'] ?? null) : null;

if (!is_numeric($rating) || !is_numeric($reviewCount)) {
    http_response_code(502);
    echo json_encode(['ok' => false]);
    exit;
}

$rating = (float)$rating;
$reviewCount = (int)$reviewCount;
if ($rating < 0 || $rating > 5 || $reviewCount < 0) {
    http_response_code(502);
    echo json_encode(['ok' => false]);
    exit;
}

echo json_encode([
    'rating' => round($rating, 1),
    'reviewCount' => $reviewCount,
], JSON_UNESCAPED_SLASHES);
