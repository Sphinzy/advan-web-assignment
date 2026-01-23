<?php
// Simple file watcher for Windows
echo "👀 Watching for changes to jobs.json...\n";
echo "Press Ctrl+C to stop\n\n";

$jsonPath = realpath("../../jobs.json");
$lastModTime = filemtime($jsonPath);

while (true) {
    clearstatcache();
    $currentModTime = filemtime($jsonPath);
    
    if ($currentModTime !== $lastModTime) {
        echo "[" . date('H:i:s') . "] 📁 File changed! Running import...\n";
        
        // Run the import script
        require "import_jobs_from_json.php";
        
        echo "[" . date('H:i:s') . "] ✅ Import completed\n\n";
        $lastModTime = $currentModTime;
    }
    
    sleep(5); // Check every 5 seconds
}