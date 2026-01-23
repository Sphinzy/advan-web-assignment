<?php
require "../config/db.php";

$apiUrl = "http://localhost:3000/api/jobs";

// Fetch API
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Decode JSON
$jobs = json_decode($response, true);

if (!is_array($jobs)) {
    die("API error");
}

// Insert into DB
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

echo "Jobs imported successfully ✅";
