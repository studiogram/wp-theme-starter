<?php

use Timber\Timber;

$context['block'] = $block;
$context['fields'] = get_fields();
$context['test'] = 'test inside';
$context['post_ID'] = get_the_ID();
Timber::render('views/blocks/' . basename(__DIR__) . '/block.twig', $context);
