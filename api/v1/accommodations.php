<?php
require_once __DIR__ . '/../config/db.php';
jsonHeaders();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

function buildAccommodation(PDO $db, array $row): array {
    foreach (['rooms_count','max_guests','min_stay_nights'] as $f) {
        if (isset($row[$f])) $row[$f] = (int)$row[$f];
    }
    $row['price_per_night_from'] = isset($row['price_per_night_from']) ? (float)$row['price_per_night_from'] : null;
    $row['distance_center_km']   = isset($row['distance_center_km'])   ? (float)$row['distance_center_km']   : null;
    $row['coordinates'] = ['lat' => (float)$row['lat'], 'lng' => (float)$row['lng']];
    unset($row['lat'], $row['lng']);
    $row['is_active']   = (bool)$row['is_active'];
    $row['is_featured'] = (bool)$row['is_featured'];
    return $row;
}

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM accommodations WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }
        echo json_encode(buildAccommodation($db, $row));
    } else {
        $borough = $_GET['borough'] ?? null;
        if ($borough) {
            $stmt = $db->prepare("SELECT * FROM accommodations WHERE borough_id = ? AND is_active = 1 ORDER BY name");
            $stmt->execute([$borough]);
        } else {
            $stmt = $db->query("SELECT * FROM accommodations ORDER BY name ASC");
        }
        echo json_encode(array_map(fn($r) => buildAccommodation($db, $r), $stmt->fetchAll()));
    }
    exit;
}

requireAuth();
$body = getJsonBody();

if ($method === 'POST') {
    $db->prepare("INSERT INTO accommodations
        (id, slug, name, type, provider_id, borough_id,
         address_full, lat, lng, distance_center_km,
         description_short, description_long, tagline,
         rooms_count, max_guests, price_per_night_from, stars_or_category,
         check_in_time, check_out_time, min_stay_nights,
         amenities, accessibility, languages_spoken, cancellation_policy,
         booking_email, booking_phone, booking_url,
         main_video_url, virtual_tour_url, is_active, is_featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    ->execute(_accValues($body));
    http_response_code(201);
    echo json_encode(['ok' => true, 'id' => $body['id']]);
    exit;
}

if ($method === 'PUT' && $id) {
    $db->prepare("UPDATE accommodations SET
        slug=?, name=?, type=?, provider_id=?, borough_id=?,
        address_full=?, lat=?, lng=?, distance_center_km=?,
        description_short=?, description_long=?, tagline=?,
        rooms_count=?, max_guests=?, price_per_night_from=?, stars_or_category=?,
        check_in_time=?, check_out_time=?, min_stay_nights=?,
        amenities=?, accessibility=?, languages_spoken=?, cancellation_policy=?,
        booking_email=?, booking_phone=?, booking_url=?,
        main_video_url=?, virtual_tour_url=?, is_active=?, is_featured=? WHERE id=?")
    ->execute(array_merge(array_slice(_accValues($body), 1), [$id]));
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE' && $id) {
    $db->prepare("DELETE FROM accommodations WHERE id = ?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

function _accValues(array $b): array {
    return [
        $b['id'], $b['slug'], $b['name'],
        $b['type'] ?? 'AGRITURISMO',
        $b['provider_id'] ?? null, $b['borough_id'] ?? null,
        $b['address_full'] ?? null,
        $b['coordinates']['lat'] ?? null, $b['coordinates']['lng'] ?? null,
        $b['distance_center_km'] ?? null,
        $b['description_short'] ?? null, $b['description_long'] ?? null,
        $b['tagline'] ?? null,
        $b['rooms_count'] ?? null, $b['max_guests'] ?? null,
        $b['price_per_night_from'] ?? null, $b['stars_or_category'] ?? null,
        $b['check_in_time'] ?? null, $b['check_out_time'] ?? null,
        $b['min_stay_nights'] ?? 1,
        $b['amenities'] ?? null, $b['accessibility'] ?? null,
        $b['languages_spoken'] ?? null, $b['cancellation_policy'] ?? null,
        $b['booking_email'] ?? null, $b['booking_phone'] ?? null,
        $b['booking_url'] ?? null,
        $b['main_video_url'] ?? null, $b['virtual_tour_url'] ?? null,
        $b['is_active'] ?? 1, $b['is_featured'] ?? 0,
    ];
}
