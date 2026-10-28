<?php
require "db_connect.php";

$service_type   = $_POST["serviceType"];
$service_number = $_POST["serviceNumber"];
$serial_number  = $_POST["serialNumber"];
$pin_code       = $_POST["pinCode"];
$captcha_input  = $_POST["captchaInput"];
$captcha_text   = $_POST["captchaText"];
$ocr_source     = $_POST["ocrSource"];

$visible = strlen(str_replace("*", "", $pin_code));

if (
    empty($service_type) ||
    empty($service_number) ||
    strlen($serial_number) !== 16 ||
    strlen($pin_code) !== 16 ||
    $visible < 6 ||
    $captcha_input !== $captcha_text
) {
    die("Invalid input data");
}

$stmt = $conn->prepare("
INSERT INTO recharge_requests
(service_type, service_number, serial_number, pin_code, visible_pin_digits, captcha_entered, captcha_generated, submission_source)
VALUES (?,?,?,?,?,?,?,?)
");

$stmt->bind_param(
    "ssssisss",
    $service_type,
    $service_number,
    $serial_number,
    $pin_code,
    $visible,
    $captcha_input,
    $captcha_text,
    $ocr_source
);

$stmt->execute();
echo "Form submitted successfully";
