<?php

namespace StudioGram;

if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Posts')) :
    class Posts
    {
        public function __construct()
        {
            $this->create_new_post_types();
            add_action('wp_loaded', [$this, 'unregister_tags']);
            // add_filter('add_meta_boxes', [$this, 'disable_side_panels']);
        }

        public function disable_side_panels()
        {
            // global $wp_meta_boxes;
            // dump($wp_meta_boxes['post']);
            // die();
        }

        public function create_new_post_types()
        {
            /* Expériences */
            // register_taxonomy('labels', 'experiences', array(
            //   'labels' => array(
            //     'name' => 'Labels',
            //     'new_item_name' => 'Nouveau label',
            //     'add_new_item' => 'Ajouter un label'
            //   ),
            //   'public' => true,
            //   'show_in_rest' => true,
            //   'hierarchical' => false,
            // ));

            // register_post_type(
            //   'experiences',
            //   [
            //     'labels' => [
            //       'name' => 'Expériences',
            //       'menu_name' => 'Expériences',
            //       'singular_name' => 'Expérience',
            //       'all_items' => 'Voir la liste',
            //       'view_item' => 'Voir les expériences',
            //       'add_new_item' => 'Nouvelle expérience',
            //       'add_new' => 'Nouvelle expérience',
            //       'edit_item' => 'Modifier l\'expérience',
            //       'update_item' => 'Modifier l\'expérience',
            //     ],
            //     'public' => true,
            //     'has_archive' => true,
            //     'menu_position' => 50,
            //     'menu_icon' => 'dashicons-images-alt',
            //     'rewrite' => ['slug' => 'experiences'],
            //     'show_in_menu' => true,
            //     'show_in_nav_menus' => true,
            //     'show_in_rest' => true,
            //     'supports' => ['title', 'editor'],
            //     'capability_type' => 'post'
            //   ]
            // );
        }

        /**
         * Unregister tags
         */
        public function unregister_tags()
        {
            unregister_taxonomy_for_object_type('post_tag', 'post');
        }
    }
endif;
