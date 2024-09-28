<?php


$DIR = dirname(__FILE__);
require_once $DIR.'/functions.php';

$id = filter_input(INPUT_GET, 'id');
$content = loadContent();

foreach($content as $item) {
	if ($item['id'] == $id) {
		$ret = generate($item['id'], $item['voice'], $item['text'], true);

		if (!$ret) {
			header("HTTP/1.1 500 Internal Server Error");
		}
	}
}