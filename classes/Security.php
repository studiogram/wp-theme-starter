<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Security')) :
    class Security
    {
        public function __construct()
        {
            add_action('admin_menu', [$this, 'security_menu'], 999);
        }

        /**
         * Adds the security menu in the WordPress admin panel.
         */
        public function security_menu()
        {
            if (!get_option('security_checked')) {
                add_menu_page(
                    "Sécurité",
                    'Sécurité',
                    'manage_options',
                    'studiogramsecurity',
                    [$this, 'add_security_page'],
                    'dashicons-shield-alt',
                    10
                );
            }
        }

        /**
         * Adds the content to the security page in the admin panel.
         */
        public function add_security_page()
        {
            if (!get_option('security_checked')) {
                $this->perform_security_update();
                add_option('security_checked', 1);
            }
            require_once STUDIOGRAM_THEME_DIR . '/admin/security.php';
        }

        /**
         * Performs security logic
         */
        private function perform_security_update()
        {
            global $wpdb;
            $random_ID = rand(9, 99);
            $wpdb->query("SET SQL_MODE='ALLOW_INVALID_DATES';");
            $query = $wpdb->prepare(
                'ALTER TABLE ' . $wpdb->prefix . 'users AUTO_INCREMENT = %d;',
                $random_ID
            );
            $wpdb->query($query);
            $user_datas = wp_get_current_user()->data;
            $user_login = $user_datas->user_login;
            $user_nicename = $user_datas->user_nicename;
            $user_email = $user_datas->user_email;
            $user_datas->user_login = 'temporary';
            $user_datas->user_nicename = 'temporary';
            $user_datas->user_email = 'temporary@studio-gram.com';
            unset($user_datas->ID);
            $new_user_ID = wp_insert_user((array) $user_datas);
            dump($new_user_ID);
            if (is_wp_error($new_user_ID))  return;
            /* Delete old user */
            wp_delete_user(get_current_user_id());
            /* Update new user */
            wp_update_user([
                'ID' => $new_user_ID,
                'user_email' => $user_email,
                'user_nicename' => $user_nicename,
                'role' => 'administrator',
            ]);
            $wpdb->update(
                $wpdb->users,
                [
                    'user_login' => $user_login,
                    'user_pass' => $user_datas->user_pass
                ],
                ['ID' => $new_user_ID]
            );
        }
    }
endif;
