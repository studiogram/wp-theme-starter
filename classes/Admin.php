<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Admin')) :
    class Admin
    {
        public function __construct()
        {
            if (function_exists('acf_add_options_page')) {
                $this->acf_options_pages();
            }
            add_filter('acf/load_field/name=custom_menu_admin', [$this, 'acf_load_menu']);
            add_filter('login_redirect', [$this, 'custom_login_redirect'], 10, 3);
            add_action('login_enqueue_scripts', [$this, 'custom_login_logo']);
            add_action('admin_enqueue_scripts', [$this, 'custom_admin_logo']);
            add_action('admin_head', [$this, 'custom_gutemberg_logo']);
            add_action('login_enqueue_scripts', [$this, 'update_admin_styles_scripts']);
            add_action('admin_enqueue_scripts', [$this, 'update_admin_styles_scripts']);

            remove_action('template_redirect', '_wp_admin_bar_init', 0);
            remove_action('admin_init', '_wp_admin_bar_init');
            remove_action('before_signup_header', '_wp_admin_bar_init');
            remove_action('activate_header', '_wp_admin_bar_init');
            remove_action('wp_body_open', 'wp_admin_bar_render', 0);
            remove_action('wp_footer', 'wp_admin_bar_render', 999);
            remove_action('in_admin_header', 'wp_admin_bar_render', 0);
            add_filter('body_class', [$this, 'remove_adminbar_class'], 999, 2);
        }

        /**
         * @param array $wp_classes
         * @param array $extra_classes
         * @return array
         */
        public function remove_adminbar_class($wp_classes, $extra_classes)
        {
            return array_diff(array_merge($wp_classes, (array) $extra_classes), array('admin-bar'));
        }


        public function update_admin_styles_scripts()
        {
            $colors_fields = ["colors_background_primary", "colors_background_secondary", "colors_buttons_background", "colors_buttons_texts"];
            foreach ($colors_fields as $color_field) {
                $color_field_value = get_field($color_field, 'custom-theme');
                if ($color_field_value) echo "<style>:root {--{$color_field}: {$color_field_value};}</style>";
            }
            wp_register_script('admin-scripts', get_stylesheet_directory_uri()   . '/build/scripts/admin.js', [], null, true);
            wp_enqueue_script('admin-scripts');
            wp_localize_script('admin-scripts', 'localize', [
                'templateUrl' => get_stylesheet_directory_uri(),
                'ajaxurl' => admin_url('admin-ajax.php')
            ]);
            wp_register_style('admin-styles', get_stylesheet_directory_uri() . '/build/styles/admin.min.css', false, null);
            wp_enqueue_style('admin-styles');
        }


        public function custom_login_logo()
        {
            $login_logo = get_field('logo_login_logo', 'custom-theme');
            $login_height = get_field('logo_login_size', 'custom-theme');
            if ($login_logo && $login_height) {
                echo "<style>#login h1 a, .login h1 a { background-image: url({$login_logo});background-size: auto {$login_height}px;height: {$login_height}px;  }</style>";
            }
        }


        public function custom_gutemberg_logo()
        {
            $gutemberg_logo = get_field('logo_gutemberg_logo', 'custom-theme');
            if ($gutemberg_logo) {
                echo "<style>body.is-fullscreen-mode .edit-post-header a.components-button.edit-post-fullscreen-mode-close:before { background: url({$gutemberg_logo}) center / calc(100% - 6px) auto no-repeat; }</style>";
            }
        }


        public function custom_admin_logo()
        {
            $login_logo = get_field('logo_admin_logo', 'custom-theme');
            $login_height = get_field('logo_admin_size', 'custom-theme');
            $padding = $login_height ? $login_height + 60 : 60;
            if ($login_logo && $login_height) {
                echo "<style> #adminmenuwrap{padding-top: {$padding}px !important; background: url({$login_logo}) top 40px center/auto {$login_height}px no-repeat; height: calc(100dvh - {$padding}px) !important;}</style>";
            }
        }


        public function acf_options_pages()
        {
            $options_theme = acf_add_options_page(array(
                'menu_title' => 'Customisations',
                'page_title' => 'Customisation thème',
                'menu_slug' => 'custom-theme',
                'capability' => 'activate_plugins',
                'icon_url' => 'dashicons-editor-alignleft',
                'redirect' => false,
                'post_id' => "custom-theme",
                'position' => 10
            ));
            $options_infos = acf_add_options_page(array(
                'menu_title' => 'Informations',
                'page_title' => 'Informations',
                'menu_slug' => 'custom-infos',
                'capability' => 'activate_plugins',
                'icon_url' => 'dashicons-info',
                'redirect' => false,
                'post_id' => "custom-infos",
                'position' => 15
            ));
        }


        /**
         * @param array $fields - List of fields
         * @return array $fields
         */
        public function acf_load_menu($fields)
        {
            foreach ($GLOBALS['menu'] as $key => $menu) {
                if ($menu[0]) $fields['choices'][$menu[2]] = $menu[0];
            }
            return $fields;
        }


        public function custom_login_redirect($redirect_to, $request, $user)
        {
            if (isset($user->roles) && is_array($user->roles) && get_field('redirection', 'custom-theme')) :
                if (in_array('administrator', $user->roles)) $redirect_to = admin_url('/post.php?post=' . get_field('redirection', 'custom-theme') . '&action=edit');
            endif;
            return $redirect_to;
        }
    }
endif;
