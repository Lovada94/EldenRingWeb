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
            'name' => [
                'rules' => 'required|min_length[2]|max_length[50]|regex_match[/\S/]',
                'errors' => [
                    'required' => 'El nombre es obligatorio',
                    'min_length' => 'Mínimo 6 caracteres',
                    'max_length' => 'Máximo 50 caracteres',
                    'regex_match' => 'No puede contener solo espacios en blanco'
                ]
            ],
            'surnames' => [
                'rules' => 'required|min_length[2]|max_length[100]|regex_match[/\S/]',
                'errors' => [
                    'required' => 'Un apellido es obligatorio',
                    'min_length' => 'Mínimo 2 caracteres',
                    'max_length' => 'Máximo 100 caracteres',
                    'regex_match' => 'No puede contener solo espacios en blanco'
                ]
            ],
            'birth_date' => [
                'rules' => 'required|valid_date',
                'errors' => [
                    'required' => 'La fecha de nacimiento es obligatoria',
                    'valid_date' => 'Debe ser una fecha válida'
                ]
            ],
            'email' => [
                'rules' => 'required|valid_email',
                'errors' => [
                    'required' => 'El email es obligatorio',
                    'valid_email' => 'Debe ser un email válido'
                ]
            ],
            'username' => [
                'rules' => 'required|min_length[3]|max_length[30]|regex_match[/\S/]',
                'errors' => [
                    'required' => 'El nombre de usuario es obligatorio',
                    'min_length' => 'Mínimo 3 caracteres',
                    'max_length' => 'Máximo 30 caracteres',
                    'regex_match' => 'No puede contener solo espacios en blanco'
                ]
            ],
            'password' => [
                'rules' => 'required|min_length[6]|regex_match[/^(?=.*[A-Z])(?=.*\d)[^\s]+$/]',
                'errors' => [
                    'required' => 'La contraseña es obligatoria',
                    'min_length' => 'Mínimo 6 caracteres',
                    'regex_match' => 'Debe contener al menos una mayúscula y un número'
                ]
            ]
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
