<?php
(PHP_SAPI !== 'cli' || isset($_SERVER['HTTP_USER_AGENT'])) && die('cli only');

require_once '../functions.php';


$content = json_decode(file_get_contents('../data/content.json'), true);


array_map(function($item) {
	generate($item['id'], $item['voice'], $item['text']);

}, $content);


echo " To join all mp3 on linux: run \nmp3wrap talk.mp3 `ls -1 audio/*.mp3 | sort`\n";