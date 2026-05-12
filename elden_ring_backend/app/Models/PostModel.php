<?php

namespace App\Models;

use CodeIgniter\Model;

class PostModel extends Model
{
    protected $table      = 'posts';
    protected $primaryKey = 'id_post';

    protected $allowedFields = ['id_user', 'id_team', 'title', 'content'];
    protected $useTimestamps = false;

    public function getAllWithMeta(): array
    {
        return $this->db->table('posts p')
            ->select('p.id_post, p.id_user, p.id_team, p.title, p.content, p.created_at, p.updated_at, u.username, u.avatar, COUNT(c.id_comment) as comment_count')
            ->join('users u', 'p.id_user = u.id_user')
            ->join('comments c', 'p.id_post = c.id_post', 'left')
            ->groupBy('p.id_post')
            ->orderBy('p.created_at', 'DESC')
            ->get()
            ->getResultArray();
    }

    public function getOneWithDetails(int $id): ?array
    {
        $post = $this->db->table('posts p')
            ->select('p.*, u.username, u.avatar')
            ->join('users u', 'p.id_user = u.id_user')
            ->where('p.id_post', $id)
            ->get()
            ->getRowArray();

        if (!$post) return null;

        if ($post['id_team']) {
            $post['team'] = $this->db->table('team')
                ->where('id_team', $post['id_team'])
                ->get()
                ->getRowArray();
        } else {
            $post['team'] = null;
        }

        $post['comments'] = $this->db->table('comments c')
            ->select('c.*, u.username, u.avatar')
            ->join('users u', 'c.id_user = u.id_user')
            ->where('c.id_post', $id)
            ->orderBy('c.created_at', 'ASC')
            ->get()
            ->getResultArray();

        return $post;
    }
}
