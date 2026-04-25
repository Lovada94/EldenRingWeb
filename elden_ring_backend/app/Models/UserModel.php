<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id_user';

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

    protected $useTimestamps = false;
}