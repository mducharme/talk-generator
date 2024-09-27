<?php

header('Content-Type: application/json');


$json = file_get_contents('php://input');
if(!$json) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No data received.']);
    die();
}

$data = json_decode($json, true);

if (json_last_error() === JSON_ERROR_NONE) {

    if (file_put_contents('../data/content.json', json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['status' => 'success', 'message' => 'Data saved successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save data to file.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data.']);
}

?>
