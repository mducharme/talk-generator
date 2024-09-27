<?php
(PHP_SAPI !== 'cli' || isset($_SERVER['HTTP_USER_AGENT'])) && die('cli only');

$DIR = dirname(__FILE__);
require_once $DIR.'/../functions.php';

$content = loadContent();
array_map(function($item) {
	$force = false;
	generate($item['id'], $item['voice'], $item['text'], $force);

}, $content);


echo " To join all mp3 on linux: run \nmp3wrap talk.mp3 `ls -1 audio/*.mp3 | sort`\n";