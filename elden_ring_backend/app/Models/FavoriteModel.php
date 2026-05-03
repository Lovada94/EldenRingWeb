<?php

namespace App\Models;

use CodeIgniter\Model;

class FavoriteModel extends Model
{
    protected $table = 'favorites';
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

    // Obtener todos los favoritos de un usuario
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)->findAll();
    }

    // Comprobar si un item ya es favorito del usuario
    public function isFavorite(int $userId, string $apiId, string $category): bool
    {
        return $this->where('id_user', $userId)
                    ->where('api_id', $apiId)
                    ->where('category', $category)
                    ->first() !== null;
    }

    // Eliminar favorito por api_id y category
    public function removeByApiId(int $userId, string $apiId, string $category): bool
    {
        return $this->where('id_user', $userId)
                    ->where('api_id', $apiId)
                    ->where('category', $category)
                    ->delete();
    }
}