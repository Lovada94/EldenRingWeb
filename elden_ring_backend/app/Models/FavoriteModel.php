<?php

namespace App\Models;

use CodeIgniter\Model;

/* Modelo de la tabla favorites: gestiona los elementos favoritos de cada usuario */
class FavoriteModel extends Model
{
    protected $table      = 'favorites';
    protected $primaryKey = 'id_favorite';

    protected $allowedFields = [
        'id_user',
        'api_id',
        'category',
        'subcategory',
        'name',
        'image'
    ];

    protected $useTimestamps = false;

    /* Obtener todos los favoritos de un usuario */
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)->findAll();
    }

    /* Comprobar si un elemento ya está en favoritos del usuario */
    public function isFavorite(int $userId, string $apiId, string $category): bool
    {
        return $this->where('id_user', $userId)
                    ->where('api_id', $apiId)
                    ->where('category', $category)
                    ->first() !== null;
    }

    /* Eliminar un favorito identificado por api_id y category */
    public function removeByApiId(int $userId, string $apiId, string $category): bool
    {
        return $this->where('id_user', $userId)
                    ->where('api_id', $apiId)
                    ->where('category', $category)
                    ->delete();
    }
}
