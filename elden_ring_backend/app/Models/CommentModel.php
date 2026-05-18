<?php

namespace App\Models;

use CodeIgniter\Model;

/* Modelo de la tabla comments: gestiona los comentarios de los posts del blog */
class CommentModel extends Model
{
    protected $table      = 'comments';
    protected $primaryKey = 'id_comment';

    protected $allowedFields = ['id_post', 'id_user', 'content'];

    /* Las marcas de tiempo las gestiona la propia base de datos */
    protected $useTimestamps = false;
}
