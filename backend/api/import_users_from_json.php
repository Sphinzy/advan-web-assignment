<?php
require "../config/db.php";

// Path to users.json
$jsonPath = "../../users.json";

if (!file_exists($jsonPath)) {
    die("❌ users.json not found");
}

// Read JSON
$jsonData = file_get_contents($jsonPath);
$users = json_decode($jsonData, true);

if (!is_array($users)) {
    die("❌ Invalid JSON format");
}

// SQL Insert
$sql = "INSERT INTO users
(id, first_name, last_name, email)
VALUES
(:id, :first_name, :last_name, :email)
ON DUPLICATE KEY UPDATE
first_name = VALUES(first_name),
last_name = VALUES(last_name),
email = VALUES(email)";

$stmt = $pdo->prepare($sql);

// Insert data
foreach ($users as $user) {
    $stmt->execute([
        ":id" => $user["id"],
        ":first_name" => $user["firstName"],
        ":last_name" => $user["lastName"],
        ":email" => $user["email"]
    ]);
}

echo "✅ Users imported successfully";
