<?php
/**
 * Funzioni di generazione JS — usate da generate.php (HTTP) e da admin/index.php (diretto).
 * NON includere direttamente: viene incluso da chi ha già caricato db.php.
 */

// ============================================================
// BOROUGHS → assets/boroughs-CXywHoot.js
// ============================================================
function generateBoroughs(PDO $db): string {
    $rows = $db->query("SELECT * FROM boroughs ORDER BY name ASC")->fetchAll();
    $items = [];
    foreach ($rows as $row) {
        $bid = $row['id'];
        $highlights  = fetchArray($db, 'borough_highlights',          'borough_id', $bid);
        $products    = fetchArray($db, 'borough_notable_products',    'borough_id', $bid);
        $exps        = fetchArray($db, 'borough_notable_experiences', 'borough_id', $bid);
        $restaurants = fetchArray($db, 'borough_notable_restaurants', 'borough_id', $bid);

        $stmt = $db->prepare("SELECT src_index, alt_text FROM borough_gallery_images WHERE borough_id=? ORDER BY sort_order");
        $stmt->execute([$bid]);
        $gallery = $stmt->fetchAll();

        $mvUrl = $row['main_video_url']   ?? '';
        $vtUrl = $row['virtual_tour_url'] ?? '';
        $lat   = (float)($row['lat'] ?? 0);
        $lng   = (float)($row['lng'] ?? 0);
        $idx   = (int)($row['hero_image_index'] ?? 0);
        $alt   = $row['hero_image_alt'] ?? '';

        $coordParts = ["lat:{$lat},lng:{$lng}"];
        if ($mvUrl) $coordParts[] = 'main_video_url:' . jsStr($mvUrl);
        if ($vtUrl) $coordParts[] = 'virtual_tour_url:' . jsStr($vtUrl);
        $coord = '{' . implode(',', $coordParts) . '}';

        $galleryJs = '[]';
        if (!empty($gallery)) {
            $gItems = array_map(fn($g) => '{src:a.borghi[' . (int)$g['src_index'] . '],alt:' . jsStr($g['alt_text']) . '}', $gallery);
            $galleryJs = '[' . implode(',', $gItems) . ']';
        }

        $restaurantsPart = empty($restaurants) ? '' : ',notable_restaurants:' . jsArray($restaurants);

        $obj  = '{id:' . jsStr($row['id']) . ',slug:' . jsStr($row['slug']) . ',name:' . jsStr($row['name']) . ',';
        $obj .= 'province:' . jsStr($row['province'] ?? '') . ',region:' . jsStr($row['region'] ?? '') . ',';
        $obj .= 'population:' . (int)($row['population'] ?? 0) . ',altitude_meters:' . (int)($row['altitude_meters'] ?? 0) . ',area_km2:' . (float)($row['area_km2'] ?? 0) . ',';
        $obj .= 'coordinates:' . $coord . ',';
        $obj .= 'description:' . jsStr($row['description'] ?? '') . ',';
        $obj .= 'highlights:' . jsArray($highlights) . ',';
        $obj .= 'hero_image:{src:a.borghi[' . $idx . '],alt:' . jsStr($alt) . '},';
        $obj .= 'gallery_images:' . $galleryJs . ',';
        $obj .= 'notable_products:' . jsArray($products) . ',';
        $obj .= 'notable_experiences:' . jsArray($exps);
        $obj .= $restaurantsPart;
        $obj .= ',companies_count:' . (int)($row['companies_count'] ?? 0) . '}';
        $items[] = $obj;
    }
    $content = 'import{I as a}from"./images-B99skb6e.js";const i=[' . implode(',', $items) . '];export{i as b};';
    return writeAsset('boroughs-CXywHoot.js', $content);
}

// ============================================================
// COMPANIES → assets/companies-DS8bqSy6.js
// ============================================================
function generateCompanies(PDO $db): string {
    $rows = $db->query("SELECT * FROM companies ORDER BY name ASC")->fetchAll();
    $items = [];
    foreach ($rows as $row) {
        $cid  = $row['id'];
        $certs   = fetchArray($db, 'company_certifications', 'company_id', $cid);
        $b2b     = fetchArray($db, 'company_b2b_interests',  'company_id', $cid);
        $stmt = $db->prepare("SELECT year,title,entity FROM company_awards WHERE company_id=? ORDER BY year DESC");
        $stmt->execute([$cid]);
        $awardsJs = '[' . implode(',', array_map(fn($aw) =>
            '{year:' . (int)$aw['year'] . ',title:' . jsStr($aw['title']) . ',entity:' . jsStr($aw['entity']) . '}',
            $stmt->fetchAll())) . ']';

        $mvUrl = $row['main_video_url']   ?? '';
        $vtUrl = $row['virtual_tour_url'] ?? '';
        $alt   = $row['hero_image_alt'] ?? '';

        $obj  = '{id:' . jsStr($row['id']) . ',slug:' . jsStr($row['slug']) . ',name:' . jsStr($row['name'] ?? '') . ',';
        $obj .= 'legal_name:' . jsStr($row['legal_name'] ?? '') . ',vat_number:' . jsStr($row['vat_number'] ?? '') . ',';
        $obj .= 'type:' . jsStr($row['type'] ?? 'MISTO') . ',tagline:' . jsStr($row['tagline'] ?? '') . ',';
        $obj .= 'description_short:' . jsStr($row['description_short'] ?? '') . ',description_long:' . jsStr($row['description_long'] ?? '') . ',';
        $obj .= 'founding_year:' . (int)($row['founding_year'] ?? 0) . ',employees_count:' . (int)($row['employees_count'] ?? 0) . ',';
        $obj .= 'borough_id:' . jsStr($row['borough_id'] ?? '') . ',address_full:' . jsStr($row['address_full'] ?? '') . ',';
        $obj .= 'coordinates:{lat:' . (float)($row['lat'] ?? 0) . ',lng:' . (float)($row['lng'] ?? 0) . '},';
        $obj .= 'contact_email:' . jsStr($row['contact_email'] ?? '') . ',contact_phone:' . jsStr($row['contact_phone'] ?? '') . ',';
        $obj .= 'website_url:' . jsStr($row['website_url'] ?? '') . ',';
        $obj .= 'social_links:{instagram:' . jsStr($row['social_instagram'] ?? '#') . ',facebook:' . jsStr($row['social_facebook'] ?? '#') . ',linkedin:' . jsStr($row['social_linkedin'] ?? '') . '},';
        $obj .= 'hero_image:{src:{},alt:' . jsStr($alt) . '},logo_url:"",gallery_images:[],';
        $obj .= 'certifications:' . jsArray($certs) . ',awards:' . $awardsJs . ',';
        $obj .= 'tier:' . jsStr($row['tier'] ?? 'BASE') . ',';
        $obj .= 'is_verified:' . ($row['is_verified'] ? '!0' : '!1') . ',is_active:' . ($row['is_active'] ? '!0' : '!1') . ',';
        $obj .= 'b2b_open_for_contact:' . ($row['b2b_open_for_contact'] ? '!0' : '!1') . ',b2b_interests:' . jsArray($b2b) . ',';
        $obj .= 'founder_name:' . jsStr($row['founder_name'] ?? '') . ',founder_quote:' . jsStr($row['founder_quote'] ?? '') . ',';
        $obj .= 'founder_image:{src:{},alt:""}';
        if ($mvUrl) $obj .= ',main_video_url:' . jsStr($mvUrl);
        if ($vtUrl) $obj .= ',virtual_tour_url:' . jsStr($vtUrl);
        $obj .= '}';
        $items[] = $obj;
    }
    $content = 'import{I as e}from"./images-B99skb6e.js";const a=[' . implode(',', $items) . '];export{a as c};';
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

        $stmt = $db->prepare("SELECT time_slot,title,description,icon FROM experience_timeline WHERE experience_id=? ORDER BY sort_order");
        $stmt->execute([$eid]);
        $tlJs = '[' . implode(',', array_map(fn($t) =>
            '{time:' . jsStr($t['time_slot']) . ',title:' . jsStr($t['title']) . ',description:' . jsStr($t['description']) . ',icon:' . jsStr($t['icon'] ?? '') . '}',
            $stmt->fetchAll())) . ']';

        $obj  = '{id:' . jsStr($row['id']) . ',slug:' . jsStr($row['slug']) . ',';
        $obj .= 'title:' . jsStr($row['title'] ?? '') . ',tagline:' . jsStr($row['tagline'] ?? '') . ',';
        $obj .= 'description_short:' . jsStr($row['description_short'] ?? '') . ',description_long:' . jsStr($row['description_long'] ?? '') . ',';
        $obj .= 'category:' . jsStr($row['category'] ?? 'CULTURA') . ',provider_id:' . jsStr($row['provider_id'] ?? '') . ',borough_id:' . jsStr($row['borough_id'] ?? '') . ',';
        $obj .= 'coordinates:{lat:' . (float)($row['lat'] ?? 0) . ',lng:' . (float)($row['lng'] ?? 0) . '},';
        $obj .= 'duration_minutes:' . (int)($row['duration_minutes'] ?? 0) . ',max_participants:' . (int)($row['max_participants'] ?? 0) . ',min_participants:' . (int)($row['min_participants'] ?? 0) . ',price_per_person:' . (float)($row['price_per_person'] ?? 0) . ',';
        $obj .= 'languages_available:' . jsArray($langs) . ',includes:' . jsArray($includes) . ',excludes:' . jsArray($excludes) . ',what_to_bring:' . jsArray($bring) . ',';
        $obj .= 'cancellation_policy:' . jsStr($row['cancellation_policy'] ?? '') . ',images:[],';
        $obj .= 'difficulty_level:' . jsStr($row['difficulty_level'] ?? 'FACILE') . ',accessibility_info:' . jsStr($row['accessibility_info'] ?? '') . ',';
        $obj .= 'seasonal_tags:' . jsArray($seasonal) . ',timeline_steps:' . $tlJs . ',';
        $obj .= 'rating:' . (float)($row['rating'] ?? 0) . ',reviews_count:' . (int)($row['reviews_count'] ?? 0) . ',';
        $obj .= 'is_active:' . ($row['is_active'] ? '!0' : '!1') . '}';
        $items[] = $obj;
    }
    $content = 'import{I as i}from"./images-B99skb6e.js";const o=[' . implode(',', $items) . '];'
             . 'function n(a){return o.find(e=>e.slug===a)}function r(a){return o.filter(e=>e.category===a)}'
             . 'function l(a){return o.filter(e=>e.provider_id===a)}'
             . 'export{r as a,l as b,o as e,n as g};';
    return writeAsset('experiences-C_0o8G74.js', $content);
}

// ============================================================
// CRAFTS → assets/craft-products-CcLcqzAP.js
// ============================================================
function generateCrafts(PDO $db): string {
    $rows = $db->query("SELECT * FROM craft_products ORDER BY name ASC")->fetchAll();
    $items = [];
    foreach ($rows as $row) {
        $cid  = $row['id'];
        $mats = fetchArray($db, 'craft_material_types', 'craft_id', $cid);

        $stmt = $db->prepare("SELECT name,values_json,price_modifier FROM craft_customization_options WHERE craft_id=?");
        $stmt->execute([$cid]);
        $optsJs = '[' . implode(',', array_map(fn($o) =>
            '{name:' . jsStr($o['name']) . ',values:' . ($o['values_json'] ?: '[]') . ($o['price_modifier'] ? ',price_modifier:' . (float)$o['price_modifier'] : '') . '}',
            $stmt->fetchAll())) . ']';

        $stmt = $db->prepare("SELECT title,description FROM craft_process_steps WHERE craft_id=? ORDER BY sort_order");
        $stmt->execute([$cid]);
        $stepsJs = '[' . implode(',', array_map(fn($s) =>
            '{title:' . jsStr($s['title']) . ',description:' . jsStr($s['description']) . ',image:{}}',
            $stmt->fetchAll())) . ']';

        $obj  = '{id:' . jsStr($row['id']) . ',slug:' . jsStr($row['slug']) . ',name:' . jsStr($row['name'] ?? '') . ',';
        $obj .= 'description_short:' . jsStr($row['description_short'] ?? '') . ',description_long:' . jsStr($row['description_long'] ?? '') . ',';
        $obj .= 'price:' . (float)($row['price'] ?? 0) . ',is_custom_order_available:' . ($row['is_custom_order_available'] ? '!0' : '!1') . ',';
        $obj .= 'lead_time_days:' . (int)($row['lead_time_days'] ?? 0) . ',material_type:' . jsArray($mats) . ',';
        $obj .= 'technique_description:' . jsStr($row['technique_description'] ?? '') . ',dimensions:' . jsStr($row['dimensions'] ?? '') . ',';
        $obj .= 'weight_grams:' . (int)($row['weight_grams'] ?? 0) . ',artisan_id:' . jsStr($row['artisan_id'] ?? '') . ',borough_id:' . jsStr($row['borough_id'] ?? '') . ',';
        $obj .= 'is_unique_piece:' . ($row['is_unique_piece'] ? '!0' : '!1') . ',production_series_qty:' . (int)($row['production_series_qty'] ?? 0) . ',';
        $obj .= 'customization_options:' . $optsJs . ',images:[],process_steps:' . $stepsJs . ',';
        $obj .= 'rating:' . (float)($row['rating'] ?? 0) . ',reviews_count:' . (int)($row['reviews_count'] ?? 0) . ',';
        $obj .= 'stock_qty:' . (int)($row['stock_qty'] ?? 0) . ',is_active:' . ($row['is_active'] ? '!0' : '!1') . '}';
        $items[] = $obj;
    }
    $content = 'import{I as i}from"./images-B99skb6e.js";const o=[' . implode(',', $items) . '];'
             . 'function r(a){return o.find(e=>e.slug===a)}'
             . 'export{o as c,r as g};';
    return writeAsset('craft-products-CcLcqzAP.js', $content);
}

// ============================================================
// Helpers
// ============================================================
function writeAsset(string $filename, string $content): string {
    $path  = ASSETS_PATH . $filename;
    $bytes = file_put_contents($path, $content);
    return $bytes === false ? "ERROR: cannot write $path" : "OK ({$bytes} bytes)";
}

function jsStr(?string $s): string {
    if ($s === null) return '""';
    $s = str_replace(['\\', '"', "\n", "\r"], ['\\\\', '\\"', '\\n', ''], $s);
    return '"' . $s . '"';
}

function jsArray(array $arr): string {
    if (empty($arr)) return '[]';
    return '[' . implode(',', array_map('jsStr', $arr)) . ']';
}
