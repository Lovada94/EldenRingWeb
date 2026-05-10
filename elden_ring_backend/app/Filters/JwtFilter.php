<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtFilter implements FilterInterface
{

    public function before(RequestInterface $request, $arguments = null)
    {

        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader) {
            return response()->setJSON([
                'status' => 401,
                'message' => 'Token requerido'
            ])->setStatusCode(401);
        }

        $token = str_replace('Bearer ', '', $authHeader);

        try {

            $decoded = JWT::decode($token, new Key(getenv('JWT_SECRET'), 'HS256'));

            $request->user = $decoded->data;
        } catch (\Exception $e) {

            return response()->setJSON([
                'status' => 401,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
