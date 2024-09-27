<?php
(PHP_SAPI !== 'cli' || isset($_SERVER['HTTP_USER_AGENT'])) && die('cli only');

$DIR = dirname(__FILE__);
require_once $DIR.'/../functions.php';

$file_content = file_get_contents($DIR.'/../../data/content.json');
$file_content = mb_convert_encoding($file_content, 'UTF-8', 'UTF-8');
$content = json_decode($file_content, true);


array_map(function($item) {
	generate($item['id'], $item['voice'], $item['text']);

}, $content);


echo " To join all mp3 on linux: run \nmp3wrap talk.mp3 `ls -1 audio/*.mp3 | sort`\n";