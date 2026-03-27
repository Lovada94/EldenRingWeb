<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth extends ResourceController
{
    public function register()
    {
        $data = $this->request->getJSON(true);

        $validation = \Config\Services::validation();

        $rules = [
            'name' => 'required|min_length[2]|max_length[50]',
            'surnames' => 'required|min_length[2]|max_length[100]',
            'birth_date' => 'required|valid_date',
            'email' => 'required|valid_email',
            'username' => 'required|min_length[3]|max_length[30]',
            'password' => 'required|min_length[6]'
        ];

        if (!$validation->setRules($rules)->run($data)) {

            return $this->respond([
                'status' => 400,
                'errors' => $validation->getErrors()
            ], 400);
        }

        $userModel = new UserModel();

        // comprobar duplicados
        if ($userModel->where('email', $data['email'])->first()) {

            return $this->respond([
                'status' => 409,
                'message' => 'Email ya registrado'
            ], 409);
        }

        if ($userModel->where('username', $data['username'])->first()) {

            return $this->respond([
                'status' => 409,
                'message' => 'Username ya registrado'
            ], 409);
        }

        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);

        $userModel->insert($data);

        return $this->respond([
            'status' => 201,
            'message' => 'Usuario registrado correctamente'
        ], 201);
    }

    public function login()
    {
        $data = $this->request->getJSON(true);

        $validation = \Config\Services::validation();

        $rules = [
            'email' => 'permit_empty|valid_email',
            'username' => 'permit_empty|min_length[3]',
            'password' => 'required|min_length[6]'
        ];

        if (!$validation->setRules($rules)->run($data)) {

            return $this->respond([
                'status' => 400,
                'errors' => $validation->getErrors()
            ], 400);
        }

        if (empty($data['email']) && empty($data['username'])) {

            return $this->respond([
                'status' => 400,
                'message' => 'Email o username obligatorio'
            ], 400);
        }

        $userModel = new UserModel();

        if (!empty($data['email'])) {

            $user = $userModel->where('email', $data['email'])->first();
        } else {

            $user = $userModel->where('username', $data['username'])->first();
        }

        if (!$user) {

            return $this->respond([
                'status' => 404,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if (!password_verify($data['password'], $user['password'])) {

            return $this->respond([
                'status' => 401,
                'message' => 'Contraseña incorrecta'
            ], 401);
        }

        $secretKey = getenv('JWT_SECRET');

        $payload = [
            'iss' => 'elden_ring_api',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24),
            'data' => [
                'id_user' => $user['id_user'],
                'email' => $user['email'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ];

        $token = JWT::encode($payload, $secretKey, 'HS256');

        $userResponse = [
            'id_user' => $user['id_user'],
            'name' => $user['name'],
            'email' => $user['email'],
            'username' => $user['username'],
            'role' => $user['role'],
            'avatar' => $user['avatar']
        ];

        return $this->respond([
            'status' => 200,
            'message' => 'Login correcto',
            'token' => $token,
            'user' => $userResponse
        ], 200);
    }

    public function testAuth()
    {
        $request = service('request');

        return $this->respond([
            'status' => 200,
            'message' => 'Token válido',
            'user' => $request->user
        ]);
    }

    public function profile()
    {
        $request = service('request');

        $user = $request->user;

        return $this->respond([
            'status' => 200,
            'user' => $user
        ]);
    }
}
