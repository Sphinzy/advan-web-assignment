<?php
require "../config/db.php";

// Path to jobs.json (relative path)
$jsonPath = "../../jobs.json";

if (!file_exists($jsonPath)) {
    die("❌ jobs.json not found at: " . realpath($jsonPath));
}

$jsonData = file_get_contents($jsonPath);
$jobs = json_decode($jsonData, true);

if (!is_array($jobs)) {
    die("❌ Invalid JSON format");
}

$sql = "INSERT INTO jobs
(id, title, type, location, description, requirements, salary, deadline, contact_email, category_id)
VALUES
(:id, :title, :type, :location, :description, :requirements, :salary, :deadline, :contact_email, :category_id)
ON DUPLICATE KEY UPDATE
title=VALUES(title),
type=VALUES(type),
location=VALUES(location),
description=VALUES(description),
requirements=VALUES(requirements),
salary=VALUES(salary),
deadline=VALUES(deadline),
contact_email=VALUES(contact_email),
category_id=VALUES(category_id)";

$stmt = $pdo->prepare($sql);

foreach ($jobs as $job) {
    $stmt->execute([
        ":id" => $job["id"],
        ":title" => $job["title"],
        ":type" => $job["type"],
        ":location" => $job["location"],
        ":description" => $job["description"],
        ":requirements" => $job["requirements"],
        ":salary" => $job["salary"],
        ":deadline" => $job["deadline"],
        ":contact_email" => $job["contactEmail"],
        ":category_id" => $job["categoryId"]
    ]);
}

echo "✅ Jobs imported successfully";
