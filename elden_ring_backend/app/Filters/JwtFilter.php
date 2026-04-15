<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        // No hay token
        if (!$header) {
            return response()->setJSON([
                'status' => 401,
                'message' => 'Token requerido'
            ])->setStatusCode(401);
        }

        // Extraer token
        $token = str_replace('Bearer ', '', $header);

        try {
            $secretKey = getenv('JWT_SECRET');

            $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

            // 🔥 CLAVE: guardar usuario en la request
            $request->user = $decoded->data;

        } catch (\Exception $e) {

            return response()->setJSON([
                'status' => 401,
                'message' => 'Token inválido o expirado',
                'error' => $e->getMessage() // opcional (quitar en producción)
            ])->setStatusCode(401);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nada
    }
}
