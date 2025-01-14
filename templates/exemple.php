<?php

/**
 * Template Name: Example
 */

use Timber\Timber;

$context = Timber::context();
$context['post'] = Timber::get_post();
$context['fields'] = get_fields();

Timber::render('views/templates/example/view.twig', $context);
