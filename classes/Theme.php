<?php

namespace StudioGram;

use FrmAppHelper;
use FrmAddonsController;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Theme')) :
    class Theme
    {
        public function __construct()
        {
            $this->set_thumbnails();
            add_action('after_setup_theme', [$this, "register_menu"]);
            add_filter('show_admin_bar', '__return_false');
            add_action('wp_enqueue_scripts', [$this, 'enqueue_styles_and_scripts']);
            add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_styles_and_scripts']);
        }

        public function set_thumbnails()
        {
            if (function_exists('add_theme_support')) {
                add_theme_support('post-thumbnails');
                remove_image_size('1536x1536');
                remove_image_size('2048x2048');
                add_image_size('small', 200, '', false);
                add_image_size('medium', 500, '', false);
                add_image_size('large', 1500, '', false);
                add_image_size('xlarge', 2000, '', false);
            }
        }

        public function enqueue_styles_and_scripts()
        {
            wp_enqueue_style('studiogram-styles', get_stylesheet_directory_uri() . "/build/styles/main.min.css", [], false);
            wp_enqueue_script('studiogram-scripts', get_stylesheet_directory_uri() . "/build/scripts/main.min.js", [], false, true);
            wp_localize_script('studiogram-scripts', 'localize', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'homeurl' => get_home_url(),
                'styles' => get_stylesheet_directory_uri(),
                'plugins' => plugins_url(),
            ]);
        }

        public function enqueue_editor_styles_and_scripts()
        {
            wp_enqueue_style('studiogram-editor-styles', get_stylesheet_directory_uri() . "/build/styles/editor.css", [], false);
            wp_enqueue_script('studiogram-editor-scripts', get_stylesheet_directory_uri() . "/build/scripts/editor.js", ['wp-dom-ready'], false, true);
        }

        public function register_menu()
        {
            register_nav_menus([
                'header_menu' => __('Header', 'studiogram'),
            ]);
        }
    }
endif;
