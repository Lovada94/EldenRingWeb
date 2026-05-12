<?php

namespace App\Controllers;

use App\Models\TeamModel;
use CodeIgniter\RESTful\ResourceController;

class Team extends ResourceController
{
    private array $allowedSlots = [
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

    // GET /team — obtener equipo activo
    public function index()
    {
        $request   = service('request');
        $userId    = $request->user->id_user;
        $teamModel = new TeamModel();
        $team      = $teamModel->getActiveByUser($userId);

        return $this->respond([
            'status' => 200,
            'team'   => $team ?? []
        ], 200);
    }

    // GET /team/all — obtener todos los equipos del usuario
    public function all()
    {
        $request   = service('request');
        $userId    = $request->user->id_user;
        $teamModel = new TeamModel();
        $teams     = $teamModel->getAllByUser($userId);

        return $this->respond([
            'status' => 200,
            'teams'  => $teams
        ], 200);
    }

    // PUT /team — guardar equipo activo
    public function update($id = null)
{
    $request = service('request');
    $userId  = $request->user->id_user;
    $data    = $this->request->getJSON(true);
    
    log_message('debug', 'PUT /team - id_team recibido: ' . ($data['id_team'] ?? 'NULL') . ' - userId: ' . $userId);

    $filtered = [];
    foreach ($this->allowedSlots as $slot) {
        $filtered[$slot] = $data[$slot] ?? null;
    }

    $teamModel = new TeamModel();
    
    // Si viene id_team en el body, actualizar ese equipo específico
    if (!empty($data['id_team'])) {
        $team = $teamModel->where('id_user', $userId)
                          ->where('id_team', $data['id_team'])
                          ->first();
        if ($team) {
            $teamModel->update($data['id_team'], $filtered);
            return $this->respond(['status' => 200, 'message' => 'Equipo guardado'], 200);
        }
    }

    $teamModel->upsertActive((int)$userId, $filtered);
    return $this->respond(['status' => 200, 'message' => 'Equipo guardado'], 200);
}

    // POST /team/save-as — guardar equipo con nombre
    public function saveAs()
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        $name = $data['name'] ?? null;
        if (empty($name)) {
            return $this->respond([
                'status'  => 400,
                'message' => 'El nombre del equipo es obligatorio'
            ], 400);
        }

        $filtered = [];
        foreach ($this->allowedSlots as $slot) {
            $filtered[$slot] = $data[$slot] ?? null;
        }

        $teamModel = new TeamModel();

        // Desactivar todos los equipos del usuario antes de crear el nuevo
        $teamModel->where('id_user', $userId)->set(['is_active' => 0])->update();

        $filtered['id_user']   = $userId;
        $filtered['is_active'] = 1;
        $filtered['name']      = $name;
        $id = $teamModel->insert($filtered);

        return $this->respond([
            'status'  => 201,
            'message' => 'Equipo guardado correctamente',
            'id_team' => $id
        ], 201);
    }

    // POST /team/load — cargar un equipo como activo
    public function loadTeam()
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        $teamId = $data['id_team'] ?? null;
        if (!$teamId) {
            return $this->respond([
                'status'  => 400,
                'message' => 'id_team es obligatorio'
            ], 400);
        }

        $teamModel = new TeamModel();
        $success   = $teamModel->loadTeam((int)$userId, (int)$teamId);

        if (!$success) {
            return $this->respond([
                'status'  => 404,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        $team = $teamModel->getActiveByUser((int)$userId);

        return $this->respond([
            'status'  => 200,
            'message' => 'Equipo cargado correctamente',
            'team'    => $team
        ], 200);
    }

    // DELETE /team/:id — eliminar un equipo
    public function delete($id = null)
    {
        $request   = service('request');
        $userId    = $request->user->id_user;
        $teamModel = new TeamModel();
        $success   = $teamModel->deleteTeam((int)$userId, (int)$id);

        if (!$success) {
            return $this->respond([
                'status'  => 404,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        return $this->respond([
            'status'  => 200,
            'message' => 'Equipo eliminado correctamente'
        ], 200);
    }

    // PATCH /team/:id — renombrar un equipo
    public function rename($id = null)
    {
        $request   = service('request');
        $userId    = $request->user->id_user;
        $data      = $this->request->getJSON(true);
        $name      = trim($data['name'] ?? '');

        if (empty($name)) {
            return $this->respond([
                'status'  => 400,
                'message' => 'El nombre es obligatorio'
            ], 400);
        }

        $teamModel = new TeamModel();
        $team = $teamModel->where('id_user', $userId)
                          ->where('id_team', $id)
                          ->first();

        if (!$team) {
            return $this->respond([
                'status'  => 404,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        $teamModel->update((int)$id, ['name' => $name]);

        return $this->respond([
            'status'  => 200,
            'message' => 'Equipo renombrado correctamente'
        ], 200);
    }
}