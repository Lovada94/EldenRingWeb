<?php

namespace App\Models;

use CodeIgniter\Model;

class TeamModel extends Model
{
    protected $table      = 'team';
    protected $primaryKey = 'id_team';

    protected $allowedFields = [
        'id_user', 'name', 'is_active',
        'weapon_r1', 'weapon_r2', 'weapon_r3',
        'weapon_l1', 'weapon_l2', 'weapon_l3',
        'arrow1', 'arrow2',
        'bolt1',  'bolt2',
        'ash1', 'ash2', 'ash3',
        'armor_head', 'armor_chest', 'armor_hands', 'armor_legs',
        'talisman1', 'talisman2', 'talisman3', 'talisman4',
        'item1', 'item2', 'item3', 'item4', 'item5',
        'item6', 'item7', 'item8', 'item9', 'item10',
        'spell1', 'spell2', 'spell3', 'spell4', 'spell5',
    ];

    protected $useTimestamps = false;

    // Obtener el equipo activo del usuario
    public function getActiveByUser(int $userId): ?array
    {
        return $this->where('id_user', $userId)
                    ->where('is_active', 1)
                    ->first();
    }

    // Obtener todos los equipos del usuario
    public function getAllByUser(int $userId): array
    {
        return $this->where('id_user', $userId)
                    ->orderBy('id_team', 'ASC')
                    ->findAll();
    }

    // Guardar o actualizar el equipo activo
    public function upsertActive(int $userId, array $data): int 
    {
    $existing = $this->getActiveByUser($userId);

    if ($existing) {
        $this->update($existing['id_team'], $data);
        return $existing['id_team'];
    } else {
        // Buscar cualquier equipo del usuario aunque no esté activo
        $any = $this->where('id_user', $userId)->first();
        if ($any) {
            $data['is_active'] = 1;
            $this->update($any['id_team'], $data);
            return $any['id_team'];
        }
        $data['id_user']   = $userId;
        $data['is_active'] = 1;
        if (empty($data['name'])) {
            $data['name'] = 'Equipo 1';
        }
        return $this->insert($data);
    }
}

    // Guardar equipo activo con nombre
    public function saveAs(int $userId, string $name, array $data): int
    {
        // Desactivar todos los equipos del usuario
        $this->where('id_user', $userId)
             ->set(['is_active' => 0])
             ->update();

        // Insertar el nuevo equipo como activo
        $data['id_user']   = $userId;
        $data['is_active'] = 1;
        $data['name']      = $name;
        return $this->insert($data);
    }

    // Cargar un equipo existente como activo
    public function loadTeam(int $userId, int $teamId): bool
    {
        // Verificar que el equipo pertenece al usuario
        $team = $this->where('id_user', $userId)
                     ->where('id_team', $teamId)
                     ->first();

        if (!$team) return false;

        // Desactivar todos los equipos del usuario
        $this->where('id_user', $userId)
             ->set(['is_active' => 0])
             ->update();

        // Activar el equipo seleccionado
        $this->update($teamId, ['is_active' => 1]);

        return true;
    }

    // Eliminar un equipo
    public function deleteTeam(int $userId, int $teamId): bool
    {
        $team = $this->where('id_user', $userId)
                     ->where('id_team', $teamId)
                     ->first();

        if (!$team) return false;

        $this->delete($teamId);
        return true;
    }
}