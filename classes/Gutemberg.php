<?php

namespace StudioGram;

use Timber\Timber;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Gutemberg')) :
    class Gutemberg
    {
        public function __construct()
        {
            add_action('init', [$this, 'register_acf_blocks']);
            add_action('wp_enqueue_scripts', [$this, 'disable_scripts'], 20);
            add_filter('allowed_block_types_all', [$this, 'limit_block_type']);
            add_filter('use_block_editor_for_post', [$this, 'disable_post_types'], 10, 2);
            add_filter('block_editor_settings_all', [$this, 'remove_blocks_suggestions'], 10, 1);
        }


        /**
         * @param array $editor_settings
         */
        public function remove_blocks_suggestions($editor_settings)
        {
            if (isset($editor_settings['enableBlockDirectory'])) {
                $editor_settings['enableBlockDirectory'] = false;
            }
            return $editor_settings;
        }


        public function disable_post_types($use_block_editor, $post)
        {
            $types = [];
            if (in_array($post->post_type, $types)) {
                return false;
            };
            return $use_block_editor;
        }


        public function disable_scripts()
        {
            wp_dequeue_style('wp-block-library');
            wp_dequeue_style('wp-block-library-theme');
            wp_dequeue_style('global-styles');
            wp_dequeue_style('classic-theme-styles');
        }

        public function limit_block_type($allowed_blocks)
        {
            $acf_blocks = STUDIOGRAM_BLOCKS_PATH;
            $acf_blocks = scandir($acf_blocks);
            if ($acf_blocks) :
                $allowed_blocks = [];
                // $allowed_blocks[] = 'core/paragraph';
                foreach ($acf_blocks as $key => $acf_block) {
                    if ($acf_block == '.' || $acf_block == '..') {
                        unset($acf_blocks[$key]);
                        continue;
                    }
                    $allowed_blocks[] = 'studiogram/' . $acf_block;
                }
            endif;
            return $allowed_blocks;
        }


        public function register_acf_blocks()
        {
            foreach ($blocks = new \DirectoryIterator(STUDIOGRAM_THEME_DIR . '/blocks') as $item) {
                if (
                    $item->isDir() && !$item->isDot()
                    && file_exists($item->getPathname() . '/block.json')
                ) {
                    register_block_type($item->getPathname(), [
                        'render_callback' => [$this, 'render_block'],
                    ]);
                }
            }
        }


        public function render_block($block)
        {
            $slug = str_replace('studiogram/', '', $block['name']);
            $file = get_theme_file_path('views/blocks/' . $slug . '/block.php');
            $context = Timber::context();

            if ($file) {
                extract($block);
                extract($context);
                require $file;
            } else {
                $context = Timber::context();
                $context['block'] = $block;
                $context['fields'] = get_fields();
                $context['test'] = 'autre';
                Timber::render('views/blocks/' . $slug . '/block.twig', $context);
            }
        }
    }
endif;
