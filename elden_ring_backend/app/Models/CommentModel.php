<?php

namespace App\Models;

use CodeIgniter\Model;

class CommentModel extends Model
{
    protected $table      = 'comments';
    protected $primaryKey = 'id_comment';

    protected $allowedFields = ['id_post', 'id_user', 'content'];
    protected $useTimestamps = false;
}
