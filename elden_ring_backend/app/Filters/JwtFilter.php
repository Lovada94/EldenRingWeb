<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/* Filtro que valida el token JWT en las rutas protegidas.
   Extrae el usuario del token y lo adjunta al objeto request. */
class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        /* Leer la cabecera Authorization */
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader) {
            return response()->setJSON([
                'status'  => 401,
                'message' => 'Token requerido'
            ])->setStatusCode(401);
        }

        /* Extraer el token quitando el prefijo "Bearer " */
        $token = str_replace('Bearer ', '', $authHeader);

        try {
            /* Decodificar y verificar la firma del token */
            $decoded = JWT::decode($token, new Key(getenv('JWT_SECRET'), 'HS256'));

            /* Adjuntar los datos del usuario al request para usarlos en los controladores */
            $request->user = $decoded->data;

        } catch (\Exception $e) {
            return response()->setJSON([
                'status'  => 401,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    /* Método requerido por la interfaz, no se necesita lógica post-respuesta */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
