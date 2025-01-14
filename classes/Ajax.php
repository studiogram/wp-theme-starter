<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Ajax')) :
    class Ajax
    {
        public function __construct()
        {
            /* Example */
            add_action('wp_ajax_nopriv_example', [$this, 'example']);
            add_action('wp_ajax_example', [$this, 'example']);
        }

        /**
         * ***********************************
         * Ajax example
         * ***********************************
         */
        public function example()
        {
            wp_send_json_success(['message' => 'AJAX works!']);
        }
    }
endif;
