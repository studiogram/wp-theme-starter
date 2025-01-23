<?php

namespace StudioGram;

use Twig\TwigFunction;
use FrmForm;
use GFAPI;


if (!defined('ABSPATH')) exit;

if (!class_exists('StudioGram\Forms')) :
    class Forms
    {

        public function __construct()
        {
            add_filter('acf/load_field/name=formidable', [$this, 'load_formidable_forms']);
            add_filter('acf/load_field/name=gform', [$this, 'load_gform_forms']);


            add_filter('timber/twig', [$this, 'add_to_twig']);
        }
        /**
         * @param array $fields - List of fields
         * @return array $fields
         */
        public function load_formidable_forms($fields)
        {
            $published_forms = FrmForm::get_published_forms();
            foreach ($published_forms as $published_form) {
                $fields['choices'][$published_form->id] = $published_form->name;
            }
            return $fields;
        }

        /**
         * @param array $fields - List of fields
         * @return array $fields
         */
        public function load_gform_forms($fields)
        {
            $published_forms = GFAPI::get_forms();
            foreach ($published_forms as $published_form) {
                $fields['choices'][$published_form['id']] = $published_form['title'];
            }
            return $fields;
        }


        /**
         * @param \Twig\Environment $twig
         * @return \Twig\Environment
         */
        public function add_to_twig($twig)
        {
            $twig->addFunction(new TwigFunction('contact', [$this, 'contact_form']));
            $twig->addFunction(new TwigFunction('formidable', [$this, 'formidable_form']));
            return $twig;
        }

        public function contact_form()
        {
            return '<div id="gf_1" data-js="form">' . do_shortcode('[gravityform id="1" title="false" description="false" ajax="true"]') . '</div>';
        }

        public function formidable_form()
        {
            return '<div>' . do_shortcode('[formidable id="1"]') . '</div>';
        }
    }
endif;
