<?php
spl_autoload_register(function ($class) {
    $baseDir = __DIR__ . '/classes/';
    $namespacePrefix = 'StudioGram\\';
    if (strncmp($namespacePrefix, $class, strlen($namespacePrefix)) !== 0) {
        return;
    }
    $relativeClass = substr($class, strlen($namespacePrefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
