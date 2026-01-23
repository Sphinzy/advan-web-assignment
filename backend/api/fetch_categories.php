<?php
require "../config/db.php";

$apiUrl = "http://localhost:3000/api/categories";

$response = file_get_contents($apiUrl);
$categories = json_decode($response, true);

$stmt = $pdo->prepare(
    "INSERT INTO categories (id, name)
     VALUES (:id, :name)
     ON DUPLICATE KEY UPDATE name=VALUES(name)"
);

foreach ($categories as $cat) {
    $stmt->execute([
        ":id" => $cat["id"],
        ":name" => $cat["name"]
    ]);
}

echo "Categories imported ✅";
