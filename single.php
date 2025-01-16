<?php

use Timber\Timber;

$context = Timber::context();
Timber::render('views/single/page/view.twig', $context);
