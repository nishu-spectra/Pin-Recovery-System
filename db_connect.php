<?php
// db_connect.php

$host = "localhost";
$user = "root";
$password = "";      // default XAMPP password is empty
$database = "nt_recharge_recovery";

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4");
?>
