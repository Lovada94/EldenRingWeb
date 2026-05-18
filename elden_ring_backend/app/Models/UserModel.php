<?php

namespace App\Models;

use CodeIgniter\Model;

/* Modelo de la tabla users: gestiona los datos de los usuarios registrados */
class UserModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = 'id_user';

    /* Campos que pueden ser insertados o actualizados */
    protected $allowedFields = [
        'name',
        'surnames',
        'birth_date',
        'email',
        'username',
        'password',
        'avatar',
        'role'
    ];

    /* Las marcas de tiempo las gestiona la propia base de datos */
    protected $useTimestamps = false;
}
