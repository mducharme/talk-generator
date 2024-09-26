<?php
(PHP_SAPI !== 'cli' || isset($_SERVER['HTTP_USER_AGENT'])) && die('cli only');

function getfilename($index, $text)
{

	$file = mb_substr($text, 0, 60);
	$file = $index.'-'.mb_ereg_replace("([^\w\s\d\-_~,;\[\]\(\).])", '', $file);
	$file = mb_ereg_replace("\s", '_', $file);
	$file = mb_ereg_replace("([\.]{2,})", '', $file);
	
	return 'audio/'.$file.'.mp3';
}

function generate($index, $voice_id, $text)
{
	$API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
	$API_KEY = 'sk_2f8543fe2f48b052bb939582d30da43fdde64996b5a59369';
	$API_VOICES = [
		'narrator' => 'cxWJJLEFcK0W1OkOu4S6',
		'fred' => 'DW1YBkrcZi5MiGbTCyWf',
		'mat' => '3uuXaGvmqoN4gRVms3Lp',

		"narrator2" => 'BHuZa353O0daphwcABkV',
		'fred2' => 'pnst7EfzAnca9yf18162',
		'mat2' => 'KeuF31OPIlIeZkFQDPo6'
	];

	$MODE = 'new'; // "all" or "new" for new-only.

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


$content = json_decode(file_get_contents('content.json'), true);


array_map(function($item) {
	generate($item['id'], $item['voice'], $item['text']);

}, $content);


echo " To join all mp3 on linux: run \nmp3wrap talk.mp3 `ls -1 audio/*.mp3 | sort`\n";