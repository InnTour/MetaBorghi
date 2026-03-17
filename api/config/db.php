<?php
// ============================================================
// MetaBorghi — Configurazione Database
// Hostinger MySQL Remote
// ============================================================

define('DB_HOST',     'localhost');      // Su Hostinger: generalmente localhost
define('DB_NAME',     'metaborghi');     // Nome database su phpMyAdmin
define('DB_USER',     'mb_user');        // Utente MySQL Hostinger
define('DB_PASS',     'CAMBIA_QUESTA_PASSWORD');
define('DB_CHARSET',  'utf8mb4');

// Token API per autenticazione endpoint di scrittura e export
define('API_TOKEN',   'CAMBIA_QUESTO_TOKEN_SEGRETO');

// Credenziali admin panel
define('ADMIN_USER',  'admin');
define('ADMIN_PASS',  'CAMBIA_QUESTA_PASSWORD_ADMIN');

// Percorso assoluto della cartella assets/ della SPA
// Su Hostinger: /home/u123456789/public_html/assets/
define('ASSETS_PATH', __DIR__ . '/../../assets/');

// ============================================================
// Connessione PDO — usata da tutti i file API
// ============================================================
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    return $pdo;
}

// ============================================================
// Helpers
// ============================================================

// Verifica Bearer token per endpoint di scrittura
function requireAuth(): void {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if ($auth !== 'Bearer ' . API_TOKEN) {
        http_response_code(401);
        die(json_encode(['error' => 'Unauthorized']));
    }
}

// Verifica sessione admin panel
function requireAdminSession(): void {
    session_start();
    if (empty($_SESSION['admin_logged_in'])) {
        header('Location: /api/admin/login.php');
        exit;
    }
}

// Header JSON + CORS
function jsonHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// Legge body JSON della request
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// Recupera array 1-to-many per un'entità
function fetchArray(PDO $db, string $table, string $fk, string $id, string $col = 'value'): array {
    $stmt = $db->prepare("SELECT `$col` FROM `$table` WHERE `$fk` = ? ORDER BY sort_order ASC");
    $stmt->execute([$id]);
    return array_column($stmt->fetchAll(), $col);
}

// Sostituisce array 1-to-many
function replaceArray(PDO $db, string $table, string $fk, string $id, array $values, string $col = 'value'): void {
    $db->prepare("DELETE FROM `$table` WHERE `$fk` = ?")->execute([$id]);
    $stmt = $db->prepare("INSERT INTO `$table` (`$fk`, `$col`, sort_order) VALUES (?, ?, ?)");
    foreach ($values as $i => $v) {
        $stmt->execute([$id, $v, $i]);
    }
}
