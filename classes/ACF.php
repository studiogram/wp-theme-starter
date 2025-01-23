<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\ACF')) :
    class ACF
    {
        public function __construct()
        {
            add_filter('tiny_mce_before_init', [$this, 'acf_wysiwyg_styles'], 99, 1);
            add_filter('acf/fields/wysiwyg/toolbars', [$this, 'custom_toolbars'], 20, 1);
        }


        public function acf_wysiwyg_styles($mce_init)
        {
            $content_css = get_stylesheet_directory_uri() . '/build/styles/editor.css';
            if (isset($mce_init['content_css'])) {
                $mce_init['content_css'] = "{$mce_init['content_css']},{$content_css}";
            }
            return $mce_init;
        }


        public function custom_toolbars($toolbars)
        {
            $toolbars['Titre'][1] = ['formatselect', 'bold', 'italic', 'link'];
            $toolbars['Basic'][1] = ['bold', 'italic', 'underline', 'bullist', 'alignleft', 'aligncenter', 'alignright', 'link'];
            $toolbars['Full'][1] = ['formatselect', 'bold', 'italic', 'underline', 'bullist', 'alignleft', 'aligncenter', 'alignright', 'link'];
            return $toolbars;
        }
    }
endif;
