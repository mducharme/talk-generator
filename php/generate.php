<?php


$DIR = dirname(__FILE__);
require_once $DIR.'/functions.php';

$id = filter_input(INPUT_GET, 'id');
var_dump($id);
$content = loadContent();

foreach($content as $item) {
	if ($item['id'] == $id) {
		generate($item['id'], $item['voice'], $item['text'], true);
	}
}