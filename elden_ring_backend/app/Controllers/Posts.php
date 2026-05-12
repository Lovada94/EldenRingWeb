<?php

namespace App\Controllers;

use App\Models\PostModel;
use App\Models\CommentModel;
use CodeIgniter\RESTful\ResourceController;

class Posts extends ResourceController
{
    // GET /posts
    public function index()
    {
        $postModel = new PostModel();
        $posts     = $postModel->getAllWithMeta();

        return $this->respond(['status' => 200, 'posts' => $posts], 200);
    }

    // POST /posts
    public function create()
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        $title   = trim($data['title']   ?? '');
        $content = trim($data['content'] ?? '');
        $idTeam  = isset($data['id_team']) && $data['id_team'] ? (int)$data['id_team'] : null;

        if (empty($title)) {
            return $this->respond(['status' => 400, 'message' => 'El título es obligatorio'], 400);
        }

        $postModel = new PostModel();
        $id = $postModel->insert([
            'id_user' => $userId,
            'id_team' => $idTeam,
            'title'   => $title,
            'content' => $content,
        ]);

        return $this->respond(['status' => 201, 'id_post' => $id], 201);
    }

    // GET /posts/:id
    public function show($id = null)
    {
        $postModel = new PostModel();
        $post      = $postModel->getOneWithDetails((int)$id);

        if (!$post) {
            return $this->respond(['status' => 404, 'message' => 'Post no encontrado'], 404);
        }

        return $this->respond(['status' => 200, 'post' => $post], 200);
    }

    // DELETE /posts/:id
    public function destroy($id = null)
    {
        $request   = service('request');
        $userId    = $request->user->id_user;
        $postModel = new PostModel();

        $post = $postModel->find((int)$id);
        if (!$post) {
            return $this->respond(['status' => 404, 'message' => 'Post no encontrado'], 404);
        }
        if ($post['id_user'] != $userId) {
            return $this->respond(['status' => 403, 'message' => 'No autorizado'], 403);
        }

        $postModel->delete((int)$id);
        return $this->respond(['status' => 200, 'message' => 'Post eliminado'], 200);
    }

    // POST /posts/:id/comments
    public function addComment($id = null)
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);
        $content = trim($data['content'] ?? '');

        if (empty($content)) {
            return $this->respond(['status' => 400, 'message' => 'El comentario no puede estar vacío'], 400);
        }

        $postModel = new PostModel();
        if (!$postModel->find((int)$id)) {
            return $this->respond(['status' => 404, 'message' => 'Post no encontrado'], 404);
        }

        $commentModel = new CommentModel();
        $commentId    = $commentModel->insert([
            'id_post' => (int)$id,
            'id_user' => $userId,
            'content' => $content,
        ]);

        $db      = \Config\Database::connect();
        $comment = $db->table('comments c')
            ->select('c.*, u.username, u.avatar')
            ->join('users u', 'c.id_user = u.id_user')
            ->where('c.id_comment', $commentId)
            ->get()
            ->getRowArray();

        return $this->respond(['status' => 201, 'comment' => $comment], 201);
    }

    // DELETE /comments/:id
    public function deleteComment($id = null)
    {
        $request      = service('request');
        $userId       = $request->user->id_user;
        $commentModel = new CommentModel();

        $comment = $commentModel->find((int)$id);
        if (!$comment) {
            return $this->respond(['status' => 404, 'message' => 'Comentario no encontrado'], 404);
        }
        if ($comment['id_user'] != $userId) {
            return $this->respond(['status' => 403, 'message' => 'No autorizado'], 403);
        }

        $commentModel->delete((int)$id);
        return $this->respond(['status' => 200, 'message' => 'Comentario eliminado'], 200);
    }
}
