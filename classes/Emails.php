<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Emails')) :
    class Emails
    {
        public function __construct()
        {
            add_filter('auto_core_update_send_email', [$this, 'disable_core_update_emails'], 10, 4);
        }


        public function disable_core_update_emails($send, $type, $core_update, $result)
        {
            if (!empty($type) && $type == 'success') return false;
            return true;
        }
    }
endif;
