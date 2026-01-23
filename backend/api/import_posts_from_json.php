<?php
require "../config/db.php";

// Path to posts.json
$jsonPath = "../../posts.json";

if (!file_exists($jsonPath)) {
    die("❌ posts.json not found");
}

// Read JSON
$jsonData = file_get_contents($jsonPath);
$posts = json_decode($jsonData, true);

if (!is_array($posts)) {
    die("❌ Invalid JSON format");
}

// SQL Insert
$sql = "INSERT INTO posts
(id, title, content, image, author_id, category_id)
VALUES
(:id, :title, :content, :image, :author_id, :category_id)
ON DUPLICATE KEY UPDATE
title=VALUES(title),
content=VALUES(content),
image=VALUES(image),
author_id=VALUES(author_id),
category_id=VALUES(category_id)";

$stmt = $pdo->prepare($sql);

// Insert posts
foreach ($posts as $post) {
    $stmt->execute([
        ":id" => $post["id"],
        ":title" => $post["title"],
        ":content" => $post["content"],
        ":image" => $post["image"],
        ":author_id" => $post["authorId"],
        ":category_id" => $post["categoryId"]
    ]);
}

echo "✅ Posts imported successfully";
