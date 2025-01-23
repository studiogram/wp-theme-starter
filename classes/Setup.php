<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Setup')) :
    class Setup
    {
        const CUSTOM_INFOS = 'custom-infos-';
        const CUSTOM_TEXTS = 'custom-texts-';

        public function __construct()
        {
            $this->disable_emojis();
            $this->remove_actions();
            $this->remove_comments();
            add_action('wp_default_scripts', [$this, 'remove_jquery_migrate']);
            add_filter('comments_open', '__return_false', 99, 2);
            add_filter('pings_open', '__return_false', 99, 2);
            add_filter('comments_array', '__return_empty_array', 10, 2);
            add_action('wp_enqueue_scripts', [$this, 'remove_styles_scripts']);
            add_filter('the_generator', [$this, 'remove_version']);
            add_filter('upload_mimes', [$this, 'add_mime_types']);
            add_filter('admin_footer_text', [$this, 'remove_footer_admin'], 20, 1);
            add_filter('timber_context', [$this, 'add_timber_context'], 99);
            error_reporting(E_ALL & ~E_WARNING & ~E_DEPRECATED & ~E_USER_DEPRECATED & ~E_NOTICE);
        }

        /**
         * @param object $scripts
         */
        public function remove_jquery_migrate($scripts)
        {
            if (!is_admin() && isset($scripts->registered['jquery'])) {
                $script = $scripts->registered['jquery'];
                if ($script->deps) {
                    $script->deps = array_diff($script->deps, ['jquery-migrate']);
                }
            }
        }

        /**
         * @param array $context
         * @return array $context
         */
        public function add_timber_context($context)
        {
            $language_prefix = STUDIOGRAM_LANGUAGES ? pll_current_language() : '';

            // $context['header'] = get_field('header', self::CUSTOM_INFOS . $language_prefix);
            // $context['footer'] = get_field('footer', self::CUSTOM_INFOS . $language_prefix);
            // $context['texts'] = get_field('texts', self::CUSTOM_TEXTS . $language_prefix);
            // $context['buttons'] = get_field('buttons', self::CUSTOM_TEXTS . $language_prefix);

            // if (STUDIOGRAM_LANGUAGES) {
            //     $context['languages'] = array_reverse(pll_the_languages(['raw' => 1]));
            //     $context['current_language'] = pll_current_language();
            //     $context['home_url'] = pll_home_url(pll_current_language());
            //     $context['posts_url'] = get_the_permalink(pll_get_post(get_option('page_for_posts')));
            // } 

            $context['body_class'] = 'studiogram ' . $context['body_class'];

            return $context;
        }


        public function remove_styles_scripts()
        {
            wp_dequeue_style('wp-block-library');
            wp_dequeue_style('wp-block-library-theme');
            wp_dequeue_style('wc-block-style');
            wp_dequeue_style('classic-theme-styles');
            wp_dequeue_style('global-styles');
            wp_deregister_script('jquery');
        }

        /**
         * @return boolean
         */
        public function remove_footer_admin()
        {
            return false;
        }

        /**
         * @param array $mimes
         * @return array
         */
        public function add_mime_types($mimes)
        {
            $mimes['svg'] = 'image/svg+xml';
            return $mimes;
        }

        public function remove_version()
        {
            return '';
        }

        /**
         * @param array $plugins
         */
        public function disable_emojis_tinymce($plugins)
        {
            if (is_array($plugins)) {
                return array_diff($plugins, ['wpemoji']);
            }
            return [];
        }

        /**
         * @param array $urls
         * @param string $relation_type
         */
        public function disable_emojis_remove_dns_prefetch($urls, $relation_type)
        {
            if ('dns-prefetch' === $relation_type) {
                $emoji_svg_url = apply_filters('emoji_svg_url', 'https://s.w.org/images/core/emoji/2/svg/');
                $urls = array_diff($urls, [$emoji_svg_url]);
            }
            return $urls;
        }

        private function remove_actions()
        {
            remove_action('wp_head', 'rest_output_link_wp_head', 10);
            remove_action('wp_head', 'wp_oembed_add_discovery_links', 10);
            remove_action('template_redirect', 'rest_output_link_header', 11, 0);
            remove_action('wp_head', 'rsd_link');
            remove_action('wp_head', 'wlwmanifest_link');
            remove_action('wp_head', 'wp_shortlink_wp_head');
        }

        private function remove_comments()
        {
            global $pagenow;
            if ($pagenow === 'edit-comments.php') {
                wp_redirect(admin_url());
                exit;
            }
            foreach (get_post_types() as $post_type) {
                if (post_type_supports($post_type, 'comments')) {
                    remove_post_type_support($post_type, 'comments');
                    remove_post_type_support($post_type, 'trackbacks');
                }
            }
        }


        private function disable_emojis()
        {
            remove_action('wp_head', 'print_emoji_detection_script', 7);
            remove_action('admin_print_scripts', 'print_emoji_detection_script');
            remove_action('wp_print_styles', 'print_emoji_styles');
            remove_action('admin_print_styles', 'print_emoji_styles');
            remove_filter('the_content_feed', 'wp_staticize_emoji');
            remove_filter('comment_text_rss', 'wp_staticize_emoji');
            remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
            add_filter('tiny_mce_plugins', [$this, 'disable_emojis_tinymce']);
            add_filter('wp_resource_hints', [$this, 'disable_emojis_remove_dns_prefetch'], 10, 2);
        }
    }
endif;
