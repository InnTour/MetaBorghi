<?php
/**
 * MetaBorghi — Static Generator
 * Rigenera i 4 file JS della SPA a partire dal database MySQL.
 *
 * Chiamata: GET /api/export/generate.php?token=API_TOKEN[&target=boroughs|companies|experiences|crafts]
 * Senza &target rigenera tutti e 4 i file.
 */

require_once __DIR__ . '/../config/db.php';
jsonHeaders();

// Autenticazione via query string (comoda per il pulsante admin)
$token = $_GET['token'] ?? $_SERVER['HTTP_X_API_TOKEN'] ?? '';
if ($token !== API_TOKEN) {
    http_response_code(401);
    die(json_encode(['error' => 'Unauthorized']));
}

$target   = $_GET['target'] ?? 'all';
$db       = getDB();
$results  = [];

if ($target === 'all' || $target === 'boroughs') {
    $results['boroughs'] = generateBoroughs($db);
}
if ($target === 'all' || $target === 'companies') {
    $results['companies'] = generateCompanies($db);
}
if ($target === 'all' || $target === 'experiences') {
    $results['experiences'] = generateExperiences($db);
}
if ($target === 'all' || $target === 'crafts') {
    $results['crafts'] = generateCrafts($db);
}

echo json_encode(['ok' => true, 'generated' => $results]);

// ============================================================
// BOROUGHS → assets/boroughs-CXywHoot.js
// Export format: import{I as a}from"./images-B99skb6e.js";const i=[...];export{i as b};
// ============================================================
function generateBoroughs(PDO $db): string {
    $rows = $db->query("SELECT * FROM boroughs ORDER BY name ASC")->fetchAll();

    $items = [];
    foreach ($rows as $row) {
        $bid = $row['id'];

        $highlights   = fetchArray($db, 'borough_highlights',            'borough_id', $bid);
        $products     = fetchArray($db, 'borough_notable_products',      'borough_id', $bid);
        $experiences  = fetchArray($db, 'borough_notable_experiences',   'borough_id', $bid);
        $restaurants  = fetchArray($db, 'borough_notable_restaurants',   'borough_id', $bid);

        $stmt = $db->prepare("SELECT src_index, alt_text FROM borough_gallery_images WHERE borough_id=? ORDER BY sort_order");
        $stmt->execute([$bid]);
        $gallery = $stmt->fetchAll();

        $mvUrl  = $row['main_video_url']   ?? '';
        $vtUrl  = $row['virtual_tour_url'] ?? '';
        $lat    = (float)($row['lat'] ?? 0);
        $lng    = (float)($row['lng'] ?? 0);
        $idx    = (int)($row['hero_image_index'] ?? 0);
        $alt    = addslashes($row['hero_image_alt'] ?? '');

        // Coordinate sub-object — video/tour solo se presenti
        $coordParts = ["lat:{$lat},lng:{$lng}"];
        if ($mvUrl) $coordParts[] = 'main_video_url:' . jsStr($mvUrl);
        if ($vtUrl) $coordParts[] = 'virtual_tour_url:' . jsStr($vtUrl);
        $coord = '{' . implode(',', $coordParts) . '}';

        // Gallery images (usa riferimenti JS a.borghi[N])
        $galleryJs = '[]';
        if (!empty($gallery)) {
            $gItems = array_map(fn($g) => '{src:a.borghi[' . (int)$g['src_index'] . '],alt:' . jsStr($g['alt_text']) . '}', $gallery);
            $galleryJs = '[' . implode(',', $gItems) . ']';
        }

        // Restaurants (opzionale — campo solo se non vuoto)
        $restaurantsPart = '';
        if (!empty($restaurants)) {
            $restaurantsPart = ',notable_restaurants:' . jsArray($restaurants);
        }

        $obj = '{';
        $obj .= 'id:'       . jsStr($row['id'])    . ',';
        $obj .= 'slug:'     . jsStr($row['slug'])   . ',';
        $obj .= 'name:'     . jsStr($row['name'])   . ',';
        $obj .= 'province:' . jsStr($row['province'] ?? '') . ',';
        $obj .= 'region:'   . jsStr($row['region']   ?? '') . ',';
        $obj .= 'population:'       . (int)($row['population']      ?? 0) . ',';
        $obj .= 'altitude_meters:'  . (int)($row['altitude_meters'] ?? 0) . ',';
        $obj .= 'area_km2:'         . (float)($row['area_km2']      ?? 0) . ',';
        $obj .= 'coordinates:'      . $coord . ',';
        $obj .= 'description:'      . jsStr($row['description'] ?? '') . ',';
        $obj .= 'highlights:'       . jsArray($highlights) . ',';
        $obj .= 'hero_image:{src:a.borghi[' . $idx . '],alt:' . jsStr($alt) . '},';
        $obj .= 'gallery_images:'   . $galleryJs . ',';
        $obj .= 'notable_products:' . jsArray($products) . ',';
        $obj .= 'notable_experiences:' . jsArray($experiences);
        $obj .= $restaurantsPart;
        $obj .= ',companies_count:' . (int)($row['companies_count'] ?? 0);
        $obj .= '}';
        $items[] = $obj;
    }

    $content = 'import{I as a}from"./images-B99skb6e.js";'
             . 'const i=[' . implode(',', $items) . '];'
             . 'export{i as b};';

    return writeAsset('boroughs-CXywHoot.js', $content);
}

// ============================================================
// COMPANIES → assets/companies-DS8bqSy6.js
// Export format: import{I as e}from"./images-B99skb6e.js";const a=[...];export{a as c};
// ============================================================
function generateCompanies(PDO $db): string {
    $rows = $db->query("SELECT * FROM companies ORDER BY name ASC")->fetchAll();

    $items = [];
    foreach ($rows as $row) {
        $cid = $row['id'];

        $certifications = fetchArray($db, 'company_certifications', 'company_id', $cid);
        $b2bInterests   = fetchArray($db, 'company_b2b_interests',  'company_id', $cid);

        $stmt = $db->prepare("SELECT year, title, entity FROM company_awards WHERE company_id=? ORDER BY year DESC");
        $stmt->execute([$cid]);
        $awards = $stmt->fetchAll();
        $awardsJs = '[' . implode(',', array_map(fn($aw) =>
            '{year:' . (int)$aw['year'] . ',title:' . jsStr($aw['title']) . ',entity:' . jsStr($aw['entity']) . '}',
            $awards)) . ']';

        $idx = (int)($row['hero_image_index'] ?? 0);
        $alt = addslashes($row['hero_image_alt'] ?? '');

        $mvUrl = $row['main_video_url']   ?? '';
        $vtUrl = $row['virtual_tour_url'] ?? '';

        $obj = '{';
        $obj .= 'id:'          . jsStr($row['id'])         . ',';
        $obj .= 'slug:'        . jsStr($row['slug'])        . ',';
        $obj .= 'name:'        . jsStr($row['name'] ?? '')  . ',';
        $obj .= 'legal_name:'  . jsStr($row['legal_name']  ?? '') . ',';
        $obj .= 'vat_number:'  . jsStr($row['vat_number']  ?? '') . ',';
        $obj .= 'type:'        . jsStr($row['type']        ?? 'MISTO') . ',';
        $obj .= 'tagline:'     . jsStr($row['tagline']     ?? '') . ',';
        $obj .= 'description_short:' . jsStr($row['description_short'] ?? '') . ',';
        $obj .= 'description_long:'  . jsStr($row['description_long']  ?? '') . ',';
        $obj .= 'founding_year:'  . (int)($row['founding_year']   ?? 0) . ',';
        $obj .= 'employees_count:'. (int)($row['employees_count'] ?? 0) . ',';
        $obj .= 'borough_id:'     . jsStr($row['borough_id'] ?? '') . ',';
        $obj .= 'address_full:'   . jsStr($row['address_full'] ?? '') . ',';
        $obj .= 'coordinates:{lat:' . (float)($row['lat'] ?? 0) . ',lng:' . (float)($row['lng'] ?? 0) . '},';
        $obj .= 'contact_email:'  . jsStr($row['contact_email']  ?? '') . ',';
        $obj .= 'contact_phone:'  . jsStr($row['contact_phone']  ?? '') . ',';
        $obj .= 'website_url:'    . jsStr($row['website_url']    ?? '') . ',';
        $obj .= 'social_links:{instagram:' . jsStr($row['social_instagram'] ?? '#')
              . ',facebook:'  . jsStr($row['social_facebook']  ?? '#')
              . ',linkedin:'  . jsStr($row['social_linkedin']  ?? '') . '},';
        $obj .= 'certifications:' . jsArray($certifications) . ',';
        $obj .= 'awards:'         . $awardsJs . ',';
        $obj .= 'tier:'           . jsStr($row['tier'] ?? 'BASE') . ',';
        $obj .= 'is_verified:'    . ($row['is_verified']           ? 'true' : 'false') . ',';
        $obj .= 'is_active:'      . ($row['is_active']             ? 'true' : 'false') . ',';
        $obj .= 'b2b_open_for_contact:' . ($row['b2b_open_for_contact'] ? 'true' : 'false') . ',';
        $obj .= 'b2b_interests:'  . jsArray($b2bInterests) . ',';
        $obj .= 'founder_name:'   . jsStr($row['founder_name']  ?? '') . ',';
        $obj .= 'founder_quote:'  . jsStr($row['founder_quote'] ?? '') . ',';
        $obj .= 'hero_image:{src:e.food.salumi[' . $idx . '],alt:' . jsStr($alt) . '}';
        if ($mvUrl) $obj .= ',main_video_url:'   . jsStr($mvUrl);
        if ($vtUrl) $obj .= ',virtual_tour_url:' . jsStr($vtUrl);
        $obj .= '}';
        $items[] = $obj;
    }

    $content = 'import{I as e}from"./images-B99skb6e.js";'
             . 'const a=[' . implode(',', $items) . '];'
             . 'export{a as c};';

    return writeAsset('companies-DS8bqSy6.js', $content);
}

// ============================================================
// EXPERIENCES → assets/experiences-C_0o8G74.js
// ============================================================
function generateExperiences(PDO $db): string {
    $rows = $db->query("SELECT * FROM experiences ORDER BY title ASC")->fetchAll();

    $items = [];
    foreach ($rows as $row) {
        $eid = $row['id'];

        $langs    = fetchArray($db, 'experience_languages',     'experience_id', $eid, 'lang');
        $includes = fetchArray($db, 'experience_includes',      'experience_id', $eid);
        $excludes = fetchArray($db, 'experience_excludes',      'experience_id', $eid);
        $bring    = fetchArray($db, 'experience_bring',         'experience_id', $eid);
        $seasonal = fetchArray($db, 'experience_seasonal_tags', 'experience_id', $eid);

        $stmt = $db->prepare("SELECT time_slot, title, description, icon FROM experience_timeline WHERE experience_id=? ORDER BY sort_order");
        $stmt->execute([$eid]);
        $timeline = $stmt->fetchAll();
        $timelineJs = '[' . implode(',', array_map(fn($t) =>
            '{time:' . jsStr($t['time_slot']) . ',title:' . jsStr($t['title'])
            . ',description:' . jsStr($t['description']) . ',icon:' . jsStr($t['icon']) . '}',
            $timeline)) . ']';

        $obj = '{';
        $obj .= 'id:'    . jsStr($row['id'])   . ',';
        $obj .= 'slug:'  . jsStr($row['slug'])  . ',';
        $obj .= 'title:' . jsStr($row['title'] ?? '') . ',';
        $obj .= 'tagline:' . jsStr($row['tagline'] ?? '') . ',';
        $obj .= 'description_short:' . jsStr($row['description_short'] ?? '') . ',';
        $obj .= 'description_long:'  . jsStr($row['description_long']  ?? '') . ',';
        $obj .= 'category:' . jsStr($row['category'] ?? 'CULTURA') . ',';
        $obj .= 'provider_id:' . jsStr($row['provider_id'] ?? '') . ',';
        $obj .= 'borough_id:'  . jsStr($row['borough_id']  ?? '') . ',';
        $obj .= 'coordinates:{lat:' . (float)($row['lat'] ?? 0) . ',lng:' . (float)($row['lng'] ?? 0) . '},';
        $obj .= 'duration_minutes:'  . (int)($row['duration_minutes']  ?? 0) . ',';
        $obj .= 'max_participants:'  . (int)($row['max_participants']   ?? 0) . ',';
        $obj .= 'min_participants:'  . (int)($row['min_participants']   ?? 0) . ',';
        $obj .= 'price_per_person:'  . (float)($row['price_per_person'] ?? 0) . ',';
        $obj .= 'languages_available:' . jsArray($langs) . ',';
        $obj .= 'includes:' . jsArray($includes) . ',';
        $obj .= 'excludes:' . jsArray($excludes) . ',';
        $obj .= 'what_to_bring:' . jsArray($bring) . ',';
        $obj .= 'cancellation_policy:' . jsStr($row['cancellation_policy'] ?? '') . ',';
        $obj .= 'images:[],';
        $obj .= 'difficulty_level:' . jsStr($row['difficulty_level'] ?? 'FACILE') . ',';
        $obj .= 'accessibility_info:' . jsStr($row['accessibility_info'] ?? '') . ',';
        $obj .= 'seasonal_tags:' . jsArray($seasonal) . ',';
        $obj .= 'timeline_steps:' . $timelineJs . ',';
        $obj .= 'rating:' . (float)($row['rating'] ?? 0) . ',';
        $obj .= 'reviews_count:' . (int)($row['reviews_count'] ?? 0) . ',';
        $obj .= 'is_active:' . ($row['is_active'] ? 'true' : 'false');
        $obj .= '}';
        $items[] = $obj;
    }

    $content = 'const r=[' . implode(',', $items) . '];export{r as e};';
    return writeAsset('experiences-C_0o8G74.js', $content);
}

// ============================================================
// CRAFTS → assets/craft-products-CcLcqzAP.js
// ============================================================
function generateCrafts(PDO $db): string {
    $rows = $db->query("SELECT * FROM craft_products ORDER BY name ASC")->fetchAll();

    $items = [];
    foreach ($rows as $row) {
        $cid = $row['id'];

        $materials = fetchArray($db, 'craft_material_types', 'craft_id', $cid);

        $stmt = $db->prepare("SELECT name, values_json, price_modifier FROM craft_customization_options WHERE craft_id=?");
        $stmt->execute([$cid]);
        $opts = $stmt->fetchAll();
        $optsJs = '[' . implode(',', array_map(fn($o) =>
            '{name:' . jsStr($o['name']) . ',values:' . ($o['values_json'] ?: '[]')
            . ',price_modifier:' . (float)$o['price_modifier'] . '}',
            $opts)) . ']';

        $stmt = $db->prepare("SELECT title, description FROM craft_process_steps WHERE craft_id=? ORDER BY sort_order");
        $stmt->execute([$cid]);
        $steps = $stmt->fetchAll();
        $stepsJs = '[' . implode(',', array_map(fn($s) =>
            '{title:' . jsStr($s['title']) . ',description:' . jsStr($s['description']) . ',image:{}}',
            $steps)) . ']';

        $obj = '{';
        $obj .= 'id:'   . jsStr($row['id'])   . ',';
        $obj .= 'slug:' . jsStr($row['slug'])  . ',';
        $obj .= 'name:' . jsStr($row['name'] ?? '') . ',';
        $obj .= 'description_short:' . jsStr($row['description_short'] ?? '') . ',';
        $obj .= 'description_long:'  . jsStr($row['description_long']  ?? '') . ',';
        $obj .= 'price:' . (float)($row['price'] ?? 0) . ',';
        $obj .= 'is_custom_order_available:' . ($row['is_custom_order_available'] ? 'true' : 'false') . ',';
        $obj .= 'lead_time_days:'        . (int)($row['lead_time_days']        ?? 0) . ',';
        $obj .= 'material_type:'         . jsArray($materials) . ',';
        $obj .= 'technique_description:' . jsStr($row['technique_description'] ?? '') . ',';
        $obj .= 'dimensions:'            . jsStr($row['dimensions']            ?? '') . ',';
        $obj .= 'weight_grams:'          . (int)($row['weight_grams']          ?? 0) . ',';
        $obj .= 'artisan_id:'            . jsStr($row['artisan_id']            ?? '') . ',';
        $obj .= 'borough_id:'            . jsStr($row['borough_id']            ?? '') . ',';
        $obj .= 'is_unique_piece:'       . ($row['is_unique_piece']       ? 'true' : 'false') . ',';
        $obj .= 'production_series_qty:' . (int)($row['production_series_qty'] ?? 0) . ',';
        $obj .= 'customization_options:' . $optsJs . ',';
        $obj .= 'images:[],';
        $obj .= 'process_steps:' . $stepsJs . ',';
        $obj .= 'rating:'        . (float)($row['rating']        ?? 0) . ',';
        $obj .= 'reviews_count:' . (int)($row['reviews_count']   ?? 0) . ',';
        $obj .= 'stock_qty:'     . (int)($row['stock_qty']        ?? 0) . ',';
        $obj .= 'is_active:'     . ($row['is_active'] ? 'true' : 'false');
        $obj .= '}';
        $items[] = $obj;
    }

    $content = 'const p=[' . implode(',', $items) . '];export{p as c};';
    return writeAsset('craft-products-CcLcqzAP.js', $content);
}

// ============================================================
// Helpers
// ============================================================

/** Scrive il file nell'assets/ della SPA */
function writeAsset(string $filename, string $content): string {
    $path = ASSETS_PATH . $filename;
    $bytes = file_put_contents($path, $content);
    if ($bytes === false) {
        return "ERROR: cannot write $path";
    }
    return "OK ({$bytes} bytes)";
}

/** Serializza una stringa PHP come stringa JS con escape corretto */
function jsStr(?string $s): string {
    if ($s === null) return '""';
    // Escape backslash, quote, newline
    $s = str_replace(['\\', '"', "\n", "\r"], ['\\\\', '\\"', '\\n', ''], $s);
    return '"' . $s . '"';
}

/** Serializza un array PHP di stringhe come array JS */
function jsArray(array $arr): string {
    if (empty($arr)) return '[]';
    return '[' . implode(',', array_map('jsStr', $arr)) . ']';
}
