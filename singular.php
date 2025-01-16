<?php

use Timber\Timber;


$context = Timber::context();
Timber::render('views/singles/page/view.twig', $context);
