<?php
if (!defined('ABSPATH')) exit;

if (!defined('TG_THEME_FILE')) {
    define('SG_THEME_FILE', __FILE__);
    define('SG_THEME_DIR', __DIR__);
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/autoloader.php';
Timber\Timber::init();
new \StudioGram\Test();
