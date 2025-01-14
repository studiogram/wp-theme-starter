<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Helpers')) :
    class Helpers
    {
        /**
         * @param string|array $content
         */
        public static function dump($content)
        {
            if (\ENVIRONMENT === 'localhost') :
                dump($content);
            endif;
        }
    }
endif;
