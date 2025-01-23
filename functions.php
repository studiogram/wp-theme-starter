<?php
if (!defined('ABSPATH')) exit;

define('STUDIOGRAM_THEME_FILE', __FILE__);
define('STUDIOGRAM_THEME_DIR', __DIR__);
define('STUDIOGRAM_BLOCKS_PATH', get_stylesheet_directory() . '/views/blocks/');
define('STUDIOGRAM_LANGUAGES', function_exists('pll_the_languages') ? pll_the_languages(['raw' => 1]) : false);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/autoloader.php';

Timber\Timber::init();
new \StudioGram\Security();
new \StudioGram\Setup();
new \StudioGram\Posts();
new \StudioGram\Theme();
new \StudioGram\ACF();
new \StudioGram\Gutemberg();
new \StudioGram\Forms();
new \StudioGram\Users();
new \StudioGram\Admin();
new \StudioGram\Ajax();
new \StudioGram\Emails();
new \StudioGram\Menu();
