<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;

/* Controlador de perfil: gestiona los datos personales, contraseña y avatar del usuario */
class Profile extends ResourceController
{
    /* GET /profile — obtener los datos del usuario autenticado */
    public function index()
    {
        $request = service('request');
        $userId  = $request->user->id_user;

        $userModel = new UserModel();
        $user      = $userModel->find($userId);

        /* Eliminar la contraseña antes de devolver los datos */
        unset($user['password']);

        return $this->respond([
            'status' => 200,
            'user'   => $user
        ], 200);
    }

    /* PUT /profile — actualizar los datos del perfil (username, email, etc.) */
    public function update($id = null)
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        $userModel  = new UserModel();
        $validation = \Config\Services::validation();

        /* Validar los campos editables, permitiendo que cada uno sea opcional */
        $rules = [
            'name'       => 'permit_empty|min_length[2]|max_length[50]',
            'surnames'   => 'permit_empty|min_length[2]|max_length[100]',
            'birth_date' => 'permit_empty|valid_date',
            'username'   => "permit_empty|min_length[3]|max_length[30]|is_unique[users.username,id_user,{$userId}]",
            'email'      => "permit_empty|valid_email|is_unique[users.email,id_user,{$userId}]",
        ];

        if (!$validation->setRules($rules)->run($data)) {
            return $this->respond([
                'status' => 400,
                'errors' => $validation->getErrors()
            ], 400);
        }

        /* Impedir que se modifiquen campos sensibles desde este endpoint */
        unset($data['password'], $data['role'], $data['avatar']);

        $userModel->update($userId, $data);

        $updated = $userModel->find($userId);
        unset($updated['password']);

        return $this->respond([
            'status'  => 200,
            'message' => 'Perfil actualizado correctamente',
            'user'    => $updated
        ], 200);
    }

    /* PUT /profile/password — cambiar la contraseña del usuario */
    public function updatePassword()
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        if (empty($data['current_password']) || empty($data['new_password'])) {
            return $this->respond([
                'status'  => 400,
                'message' => 'Faltan campos obligatorios'
            ], 400);
        }

        $userModel = new UserModel();
        $user      = (array) $userModel->find($userId);

        /* Verificar que la contraseña actual introducida es correcta */
        if (!password_verify($data['current_password'], $user['password'])) {
            return $this->respond([
                'status'  => 401,
                'message' => 'La contraseña actual es incorrecta'
            ], 401);
        }

        if (strlen($data['new_password']) < 6) {
            return $this->respond([
                'status'  => 400,
                'message' => 'La nueva contraseña debe tener al menos 6 caracteres'
            ], 400);
        }

        /* Hashear y guardar la nueva contraseña */
        $userModel->update($userId, [
            'password' => password_hash($data['new_password'], PASSWORD_DEFAULT)
        ]);

        return $this->respond([
            'status'  => 200,
            'message' => 'Contraseña actualizada correctamente'
        ], 200);
    }

    /* POST /profile/avatar — subir o reemplazar la imagen de avatar */
    public function updateAvatar()
    {
        $request = service('request');
        $userId  = $request->user->id_user;

        $file = $this->request->getFile('avatar');

        if (!$file || !$file->isValid()) {
            return $this->respond([
                'status'  => 400,
                'message' => 'No se ha enviado ninguna imagen válida'
            ], 400);
        }

        /* Validar tipo MIME y tamaño máximo de la imagen */
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            return $this->respond([
                'status'  => 400,
                'message' => 'Solo se permiten imágenes JPG, PNG o WEBP'
            ], 400);
        }

        if ($file->getSize() > 2 * 1024 * 1024) {
            return $this->respond([
                'status'  => 400,
                'message' => 'La imagen no puede superar 2MB'
            ], 400);
        }

        /* Generar un nombre único y mover el archivo al directorio de avatares */
        $newName    = 'avatar_' . $userId . '_' . time() . '.' . $file->getExtension();
        $uploadPath = FCPATH . 'uploads/avatars/';

        $file->move($uploadPath, $newName);

        /* Borrar el avatar anterior del disco si no es el predeterminado */
        $userModel   = new UserModel();
        $currentUser = $userModel->find($userId);
        $oldAvatar   = $currentUser['avatar'] ?? 'default.png';

        if ($oldAvatar !== 'default.png') {
            $oldPath = $uploadPath . $oldAvatar;
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        /* Actualizar el nombre del avatar en la base de datos */
        $userModel->update($userId, ['avatar' => $newName]);

        return $this->respond([
            'status'  => 200,
            'message' => 'Avatar actualizado correctamente',
            'avatar'  => $newName
        ], 200);
    }

    /* DELETE /profile — eliminar la cuenta del usuario autenticado */
    public function delete($id = null)
    {
        $request = service('request');
        $userId  = $request->user->id_user;

        $userModel = new UserModel();
        $userModel->delete($userId);

        return $this->respond([
            'status'  => 200,
            'message' => 'Cuenta eliminada correctamente'
        ], 200);
    }
}
