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

// Equipo
$routes->get('team',           'Team::index',    ['filter' => 'jwt']);
$routes->get('team/all',       'Team::all',      ['filter' => 'jwt']);
$routes->put('team',           'Team::update',   ['filter' => 'jwt']);
$routes->post('team/save-as',  'Team::saveAs',   ['filter' => 'jwt']);
$routes->post('team/load',     'Team::loadTeam', ['filter' => 'jwt']);
$routes->delete('team/(:num)', 'Team::delete/$1', ['filter' => 'jwt']);
$routes->patch('team/(:num)',  'Team::rename/$1', ['filter' => 'jwt']);

// Blog
$routes->get('posts',                   'Posts::index',                       ['filter' => 'jwt']);
$routes->post('posts',                  'Posts::create',                      ['filter' => 'jwt']);
$routes->get('posts/(:num)',            'Posts::show/$1',                     ['filter' => 'jwt']);
$routes->delete('posts/(:num)',         'Posts::destroy/$1',                  ['filter' => 'jwt']);
$routes->post('posts/(:num)/comments',  'Posts::addComment/$1',               ['filter' => 'jwt']);
$routes->delete('comments/(:num)',      'Posts::deleteComment/$1',            ['filter' => 'jwt']);