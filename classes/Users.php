<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Users')) :
    class Users
    {
        private $superadmins;

        public function __construct()
        {
            $this->superadmins = get_option('superadmins');
            add_action('show_user_profile', [$this, 'extra_profile_fields'], 10);
            add_action('edit_user_profile', [$this, 'extra_profile_fields'], 10);
            add_action('personal_options_update', [$this, 'save_extra_profile_fields']);
            add_action('edit_user_profile_update', [$this, 'save_extra_profile_fields']);
        }

        public function extra_profile_fields($user)
        {
            require_once STUDIOGRAM_THEME_DIR . '/admin/profile.php';
        }

        public function save_extra_profile_fields($user_ID)
        {
            if (!current_user_can('edit_user', $user_ID)) return false;
            $superadmins = $this->superadmins ? $this->superadmins : [];
            if (isset($_POST['superadmin'])) {
                if (!in_array($user_ID, $superadmins)) $superadmins[] = $user_ID;
            } else {
                if (in_array($user_ID, $superadmins)) unset($superadmins[array_search($user_ID, $superadmins)]);
            }
            update_option('superadmins', $superadmins);
        }
    }
endif;
