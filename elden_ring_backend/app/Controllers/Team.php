<?php

namespace App\Controllers;

use App\Models\TeamModel;
use CodeIgniter\RESTful\ResourceController;

class Team extends ResourceController
{
    // GET /team — obtener equipo del usuario
    public function index()
    {
        $request = service('request');
        $userId  = $request->user->id_user;

        $teamModel = new TeamModel();
        $team      = $teamModel->getByUser($userId);

        return $this->respond([
            'status' => 200,
            'team'   => $team ?? []
        ], 200);
    }

    // PUT /team — guardar/actualizar equipo
    public function update($id = null)
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        // Slots permitidos
        $allowedSlots = [
            'weapon_r1', 'weapon_r2', 'weapon_r3',
            'weapon_l1', 'weapon_l2', 'weapon_l3',
            'arrow1', 'arrow2',
            'bolt1',  'bolt2',
            'armor_head', 'armor_chest', 'armor_hands', 'armor_legs',
            'talisman1', 'talisman2', 'talisman3', 'talisman4',
            'item1', 'item2', 'item3', 'item4', 'item5',
            'item6', 'item7', 'item8', 'item9', 'item10',
        ];

        // Filtrar solo los campos permitidos
        $filtered = [];
        foreach ($allowedSlots as $slot) {
            $filtered[$slot] = $data[$slot] ?? null;
        }

        $teamModel = new TeamModel();
        $teamModel->upsert((int)$userId, $filtered);

        return $this->respond([
            'status'  => 200,
            'message' => 'Equipo guardado correctamente'
        ], 200);
    }
}