<?php

namespace App\Controllers;

use App\Models\TeamModel;
use CodeIgniter\RESTful\ResourceController;

/* Controlador de equipo: gestiona la creación, carga, guardado y eliminación de builds */
class Team extends ResourceController
{
    /* Slots de equipamiento permitidos en el body de las peticiones */
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

    /* GET /team — obtener el equipo activo del usuario */
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

    /* GET /team/all — obtener todos los equipos guardados del usuario */
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

    /* PUT /team — guardar el estado actual del equipo activo */
    public function update($id = null)
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);

        /* Filtrar el body para conservar solo los slots permitidos */
        $filtered = [];
        foreach ($this->allowedSlots as $slot) {
            $filtered[$slot] = $data[$slot] ?? null;
        }

        $teamModel = new TeamModel();

        /* Si llega id_team en el body, actualizar ese equipo específico */
        if (!empty($data['id_team'])) {
            $team = $teamModel->where('id_user', $userId)
                              ->where('id_team', $data['id_team'])
                              ->first();
            if (!$team) {
                return $this->respond(['status' => 404, 'message' => 'Equipo no encontrado'], 404);
            }
            $teamModel->update($data['id_team'], $filtered);
            return $this->respond(['status' => 200, 'message' => 'Equipo guardado'], 200);
        }

        /* Sin id_team: actualizar o crear el equipo activo */
        $teamModel->upsertActive((int)$userId, $filtered);
        return $this->respond(['status' => 200, 'message' => 'Equipo guardado'], 200);
    }

    /* POST /team/save-as — crear un equipo nuevo con nombre */
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

        /* Filtrar solo los slots de equipamiento válidos */
        $filtered = [];
        foreach ($this->allowedSlots as $slot) {
            $filtered[$slot] = $data[$slot] ?? null;
        }

        $teamModel = new TeamModel();

        /* Desactivar todos los equipos del usuario antes de crear el nuevo */
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

    /* POST /team/load — cargar un equipo guardado como activo */
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

        /* Devolver el equipo recién activado */
        $team = $teamModel->getActiveByUser((int)$userId);

        return $this->respond([
            'status'  => 200,
            'message' => 'Equipo cargado correctamente',
            'team'    => $team
        ], 200);
    }

    /* DELETE /team/:id — eliminar un equipo guardado */
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

    /* PATCH /team/:id — renombrar un equipo guardado */
    public function rename($id = null)
    {
        $request = service('request');
        $userId  = $request->user->id_user;
        $data    = $this->request->getJSON(true);
        $name    = trim($data['name'] ?? '');

        if (empty($name)) {
            return $this->respond([
                'status'  => 400,
                'message' => 'El nombre es obligatorio'
            ], 400);
        }

        $teamModel = new TeamModel();

        /* Verificar que el equipo pertenece al usuario autenticado */
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
