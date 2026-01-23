<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require "../config/db.php"; // adjust your path to db.php

$apiUrl = "../../categories.json"; // your JSON file

$response = file_get_contents($apiUrl);
$categories = json_decode($response, true);

if (!$categories) {
    echo json_encode(["success"=>false, "message"=>"Invalid JSON"]);
    exit;
}

$stmt = $pdo->prepare(
    "INSERT INTO categories (name) VALUES (:name)
     ON DUPLICATE KEY UPDATE name=:name"
);

$inserted = 0;

foreach ($categories as $cat) {
    $stmt->execute([":name" => $cat["name"]]);
    $inserted++;
}

echo json_encode(["success"=>true, "message"=>"Categories imported", "inserted"=>$inserted]);
