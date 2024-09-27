<?php

function getfilename($index, $text)
{

	/*$file = mb_substr($text, 0, 60);
	$file = $index.'-'.mb_ereg_replace("([^\w\s\d\-_~,;\[\]\(\).])", '', $file);
	$file = mb_ereg_replace("\s", '_', $file);
	$file = mb_ereg_replace("([\.]{2,})", '', $file);*/
	$file = $index;
	return '../audio/'.$file.'.mp3';
}

function generate($index, $voice_id, $text, $MODE = 'new')
{
	$API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
	$API_KEY = file_get_contents("../data/API_KEY.txt");
	$API_VOICES = [
		'narrator' => 'cxWJJLEFcK0W1OkOu4S6',
		'fred' => 'DW1YBkrcZi5MiGbTCyWf',
		'mat' => '3uuXaGvmqoN4gRVms3Lp',
		"narrator2" => 'pqHfZKP75CvOlQylNhV4'
	];

	$DELAY = 2; // in seconds

	$file = getfilename($index, $text);
	if (file_exists($file) && $MODE == 'new') {
		echo 'Skipping: file '.$file.' already exists.'."\n";
		return;
	} 

	sleep($DELAY);

	$ch = curl_init();

	$text = str_replace('’', '\'', $text);
	$text = str_replace('“', '"', $text);
	$text = str_replace('”', '"', $text);
	$text = str_replace('…', '...', $text);
	$text = str_replace('é', 'e', $text);
	$text = str_replace('—', '-', $text);

	curl_setopt($ch, CURLOPT_URL,  $API_URL.$API_VOICES[$voice_id]);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_ENCODING, "");
	curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
	curl_setopt($ch, CURLOPT_TIMEOUT, 30);
	curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		"Content-Type: application/json",
		"xi-api-key: ".$API_KEY
	]);
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
		"voice_settings" => [
			"stability" => 0.5,
			"similarity_boost" => 0.75  
		],
		"text" => ".$text."
	]));

	$response = curl_exec($ch);
	$err = curl_error($ch);

	curl_close($ch);

	if ($err) {
		echo "cURL Error #:" . $err;
	} else {
		file_put_contents($file, $response);
	}
}