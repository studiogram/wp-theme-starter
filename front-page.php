<?php

use Timber\Timber;

dump('dodo');
$context = Timber::context();
$context['front'] = 'front page info';
Timber::render('views/templates/front-page/view.twig', $context);
