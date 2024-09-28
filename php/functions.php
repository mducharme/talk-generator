<?php

function loadContent()
{
    $DIR = dirname(__FILE__);
    $file_content = file_get_contents($DIR.'/../data/content.json');
    $file_content = mb_convert_encoding($file_content, 'UTF-8', 'UTF-8');
    return json_decode($file_content, true);
}

function getFilename($index, $text)
{
    $file = $index;
    return '../audio/'.$file.'.mp3';
}

function generate($index, $voice_id, $text, $force=false)
{
    $DIR = dirname(__FILE__);

    $API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
    $API_KEY = file_get_contents($DIR.'/../data/API_KEY.txt');
    $API_VOICES = [
        'narrator' => 'cxWJJLEFcK0W1OkOu4S6',
        'fred' => 'DW1YBkrcZi5MiGbTCyWf',
        'mat' => '3uuXaGvmqoN4gRVms3Lp',
        'narrator2' => 'pqHfZKP75CvOlQylNhV4'
    ];

    $file = getFilename($index, $text);
    if (file_exists($DIR.'/'.$file) && !$force) {
        echo 'Skipping: file '.$file.' already exists.'."\n";
        return;
    }

    $ch = curl_init();

    // Normalize text (handle special characters)
    $text = strtr($text, [
        '’' => "'",
        '“' => '"',
        '”' => '"',
        '…' => '...',
        'é' => 'e',
        '—' => '-'
    ]);

    // JSON payload
    $postData = json_encode([
        "voice_settings" => [
            "stability" => 0.5,
            "similarity_boost" => 0.75,
            'style'=> 0,
            'use_speaker_boost' => false
        ],
        "text" => $text
    ]);

    $contentLength = strlen($postData);

    curl_setopt($ch, CURLOPT_URL,  $API_URL.$API_VOICES[$voice_id]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_ENCODING, "");
    curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Content-Length: $contentLength",
        "xi-api-key: ".$API_KEY
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

    // Execute the API call
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);

    curl_close($ch);

    if ($err) {
        echo "cURL Error #:" . $err;
        return;
    }

    // Check if HTTP status is 200 (success)
    if ($httpCode !== 200) {
        echo "Error: Received HTTP status code " . $httpCode . "\n";
        return;
    }

    // Save the MP3 file if the response is valid
    file_put_contents($DIR.'/'.$file, $response);
    echo "Saved to ".$file."\n";
}
