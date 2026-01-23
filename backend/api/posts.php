<?php
require "../config/db.php"; // PDO connection

// ✅ CORS headers for frontend
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // allow your frontend origin here
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request (for DELETE with headers)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Read the ID sent from JS (JSON body)
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "error" => "ID missing"]);
        exit;
    }

    try {
        // ✅ THIS is your DELETE SQL
        $stmt = $pdo->prepare("DELETE FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "No product found with that ID"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }

} else {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
}
