<?php
// Setup script to verify paths and run initial import
echo "<pre>";
echo "🔧 Jobs Import System Setup\n";
echo str_repeat("=", 50) . "\n";

// Check current directory
echo "📁 Current directory: " . __DIR__ . "\n";

// Check JSON file path
$jsonPath = "../../jobs.json";
echo "📄 Looking for JSON at: " . realpath($jsonPath) . "\n";

if (file_exists($jsonPath)) {
    echo "✅ jobs.json found!\n";
    
    // Check JSON validity
    $jsonData = file_get_contents($jsonPath);
    $jobs = json_decode($jsonData, true);
    
    if (is_array($jobs)) {
        echo "✅ Valid JSON with " . count($jobs) . " jobs\n";
        
        // Show sample job
        if (!empty($jobs[0])) {
            echo "\n📋 Sample job (first entry):\n";
            echo "  ID: " . ($jobs[0]['id'] ?? 'N/A') . "\n";
            echo "  Title: " . ($jobs[0]['title'] ?? 'N/A') . "\n";
            echo "  Type: " . ($jobs[0]['type'] ?? 'N/A') . "\n";
        }
    } else {
        echo "❌ Invalid JSON format\n";
    }
} else {
    echo "❌ jobs.json not found!\n";
    echo "   Expected at: " . realpath(dirname($jsonPath)) . "/jobs.json\n";
}

// Check database connection
require "../config/db.php";
try {
    $pdo->query("SELECT 1");
    echo "✅ Database connection successful\n";
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🚀 Ready to import? Run:\n";
echo "1. Browser: http://localhost/NU/job/backend/api/import_jobs_from_json.php\n";
echo "2. Command: php backend/api/import_jobs_from_json.php\n";
echo str_repeat("=", 50) . "\n";

// Auto-run import if requested
if (isset($_GET['run']) && $_GET['run'] == 'true') {
    echo "\n🔄 Running import...\n";
    echo str_repeat("-", 50) . "\n";
    
    // Include and run the import script
    require "import_jobs_from_json.php";
}