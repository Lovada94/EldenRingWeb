<?php

namespace App\Controllers;

use App\Models\FavoriteModel;
use CodeIgniter\RESTful\ResourceController;

class Favorites extends ResourceController
{
    // GET /favorites — obtener favoritos del usuario autenticado
    public function index()
    {
        $request  = service('request');
        $userId   = $request->user['id_user'];

        $favoriteModel = new FavoriteModel();
        $favorites     = $favoriteModel->getByUser($userId);

        return $this->respond([
            'status'    => 200,
            'favorites' => $favorites
        ], 200);
    }

    // POST /favorites — añadir favorito
    public function create()
    {
        $request = service('request');
        $userId  = $request->user['id_user'];
        $data    = $this->request->getJSON(true);

        // Validación
        $validation = \Config\Services::validation();

        $rules = [
            'api_id'   => 'required',
            'category' => 'required',
            'name'     => 'required',
        ];

        if (!$validation->setRules($rules)->run($data)) {
            return $this->respond([
                'status' => 400,
                'errors' => $validation->getErrors()
            ], 400);
        }

        $favoriteModel = new FavoriteModel();

        // Comprobar si ya existe
        if ($favoriteModel->isFavorite($userId, $data['api_id'], $data['category'])) {
            return $this->respond([
                'status'  => 409,
                'message' => 'Este elemento ya está en favoritos'
            ], 409);
        }

        $favoriteModel->insert([
            'id_user'  => $userId,
            'api_id'   => $data['api_id'],
            'category' => $data['category'],
            'name'     => $data['name'],
            'image'    => $data['image'] ?? null
        ]);

        return $this->respond([
            'status'  => 201,
            'message' => 'Añadido a favoritos'
        ], 201);
    }

    // DELETE /favorites — eliminar favorito por api_id y category
    public function delete($id = null)
    {
        $request  = service('request');
        $userId   = $request->user['id_user'];
        $data     = $this->request->getJSON(true);

        if (empty($data['api_id']) || empty($data['category'])) {
            return $this->respond([
                'status'  => 400,
                'message' => 'api_id y category son obligatorios'
            ], 400);
        }

        $favoriteModel = new FavoriteModel();

        if (!$favoriteModel->isFavorite($userId, $data['api_id'], $data['category'])) {
            return $this->respond([
                'status'  => 404,
                'message' => 'Favorito no encontrado'
            ], 404);
        }

        $favoriteModel->removeByApiId($userId, $data['api_id'], $data['category']);

        return $this->respond([
            'status'  => 200,
            'message' => 'Eliminado de favoritos'
        ], 200);
    }
}