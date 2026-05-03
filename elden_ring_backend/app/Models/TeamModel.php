<?php

namespace App\Models;

use CodeIgniter\Model;

class TeamModel extends Model
{
    protected $table      = 'team';
    protected $primaryKey = 'id_team';

    protected $allowedFields = [
        'id_user',
        'weapon_r1', 'weapon_r2', 'weapon_r3',
        'weapon_l1', 'weapon_l2', 'weapon_l3',
        'arrow1', 'arrow2',
        'bolt1',  'bolt2',
        'armor_head', 'armor_chest', 'armor_hands', 'armor_legs',
        'talisman1', 'talisman2', 'talisman3', 'talisman4',
        'item1', 'item2', 'item3', 'item4', 'item5',
        'item6', 'item7', 'item8', 'item9', 'item10',
    ];

    protected $useTimestamps = false;

    public function getByUser(int $userId): ?array
    {
        return $this->where('id_user', $userId)->first();
    }

    public function upsert(int $userId, array $data): void
    {
        $existing = $this->where('id_user', $userId)->first();

        if ($existing) {
            $this->where('id_user', $userId)->set($data)->update();
        } else {
            $data['id_user'] = $userId;
            $this->insert($data);
        }
    }
}