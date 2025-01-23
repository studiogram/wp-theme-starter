<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Menu')) :
    class Menu
    {
        public function __construct()
        {
            add_action('admin_menu', [$this, 'custom_menu'], 99);
        }

        public function custom_menu()
        {
            /* Menus à masquer */
            if (is_array(get_option('superadmins')) && !in_array(get_current_user_id(), get_option('superadmins'))) {
                $menus = get_field('custom_menu_admin', 'custom-theme');
                foreach ($menus as $menu) remove_menu_page($menu);
            }

            /* Customisations */
            if (is_array(get_option('superadmincustom')) && !in_array(get_current_user_id(), get_option('superadmincustom'))) {
                remove_menu_page("custom-theme");
            }

            /* List of pages */
            $pages = get_field('menu_pages', 'custom-theme');
            $main_page = 0;
            foreach ($pages as $key => $page_ID) {
                if ($key == 0) {
                    $main_page = $page_ID;
                    add_menu_page('Pages', 'Pages', 'manage_options', '/post.php?post=' . $main_page . '&action=edit', '', 'dashicons-media-default', 10);
                }
                add_submenu_page('/post.php?post=' . $main_page . '&action=edit', get_the_title($page_ID), get_the_title($page_ID), 'manage_options', '/post.php?post=' . $page_ID . '&action=edit');
            }

            /* Logout */
            add_menu_page("logout", "Se déconnecter", 'manage_options', wp_logout_url(), null, 'dashicons-no', 200);
        }
    }
endif;
