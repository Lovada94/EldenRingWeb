<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->options('(:any)', static function () {
    return response()->setStatusCode(200);
});
$routes->get('/', 'Home::index');
$routes->post('register', 'Auth::register');
$routes->post('login', 'Auth::login');

$routes->get('test-auth', 'Auth::testAuth', ['filter' => 'jwt']);