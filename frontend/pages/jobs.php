<?php
require "../../backend/config/db.php";
$jobs = $pdo->query("SELECT * FROM jobs")->fetchAll(PDO::FETCH_ASSOC);
?>

<?php foreach ($jobs as $job): ?>
    <h3><?= $job['title'] ?></h3>
    <p><?= $job['location'] ?> | <?= $job['salary'] ?></p>
    <hr>
<?php endforeach; ?>
