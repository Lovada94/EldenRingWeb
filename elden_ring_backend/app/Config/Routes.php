<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->options('(:any)', static function () {
    return response()->setStatusCode(200);
});

$routes->post('register', 'Auth::register');
$routes->post('login', 'Auth::login');

$routes->get('test-auth', 'Auth::testAuth', ['filter' => 'jwt']);

// Favoritos
$routes->get('favorites',    'Favorites::index',  ['filter' => 'jwt']);
$routes->post('favorites',   'Favorites::create', ['filter' => 'jwt']);
$routes->delete('favorites', 'Favorites::delete', ['filter' => 'jwt']);

// Perfil
$routes->get('profile',             'Profile::index',          ['filter' => 'jwt']);
$routes->put('profile',             'Profile::update',         ['filter' => 'jwt']);
$routes->put('profile/password',    'Profile::updatePassword', ['filter' => 'jwt']);
$routes->post('profile/avatar',     'Profile::updateAvatar',   ['filter' => 'jwt']);
$routes->delete('profile',          'Profile::delete',         ['filter' => 'jwt']);