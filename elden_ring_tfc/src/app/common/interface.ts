//User interface
export interface User {
  id_user: number;
  name: string;
  surnames: string;
  birth_date: string;
  email: string;
  username: string;
  avatar: string;
  role: string;
  created_at: string;
  updated_at: string;
}

//Login interface
export interface LoginResponse {
  status: number;
  message: string;
  user: User;
  token: string;
}

//Register interface
export interface RegisterResponse {
  status: number;
  message: string;
}

//Login credentials interface
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

//Register credentials interface
export interface RegisterCredentials {
  name?: string;
  surnames?: string;
  birth_date?: string;
  email?: string;
  username?: string;
  password?: string;
}
// ============================================================
// INTERFACES GENÉRICAS (respuesta base de la API)
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  count: number;
  total: number;
  data: T[];
}

// ============================================================
// INTERFACES COMPARTIDAS
// ============================================================

export interface Stat {
  name: string;
  amount: number;
}

export interface ScalesWith {
  name: string;
  scaling?: string;
}

export interface Requirement {
  name: string;
  amount: number;
}

// ============================================================
// WEAPONS
// ============================================================

export interface Weapon {
  id: string;
  name: string;
  image: string | null;
  description: string;
  attack: Stat[];
  defence: Stat[];
  scalesWith: ScalesWith[];
  requiredAttributes: Requirement[];
  category: string;
  weight: number;
}

// ============================================================
// AMMOS
// ============================================================

export interface Ammo {
  id: string;
  name: string;
  image: string | null;
  description: string;
  type: string;
  attackPower: Stat[];
  passive: string;
}

// ============================================================
// ARMORS
// ============================================================

export interface Armor {
  id: string;
  name: string;
  image: string | null;
  description: string;
  category: string;
  dmgNegation: Stat[];
  resistance: Stat[];
  weight: number;
}

// ============================================================
// ASHES OF WAR
// ============================================================

export interface Ash {
  id: string;
  name: string;
  image: string | null;
  description: string;
  affinity: string;
  skill: string;
}

// ============================================================
// BOSSES
// ============================================================

export interface Boss {
  id: string;
  name: string;
  image: string | null;
  description: string;
  location: string;
  region: string;
  drops: string[];
  healthPoints: string;
}

// ============================================================
// CLASSES
// ============================================================

export interface ClassStats {
  level: string;
  vigor: string;
  mind: string;
  endurance: string;
  strength: string;
  dexterity: string;
  intelligence: string;
  faith: string;
  arcane: string;
}

export interface EldenClass {
  id: string;
  name: string;
  image: string | null;
  description: string;
  stats: ClassStats;
}

// ============================================================
// CREATURES
// ============================================================

export interface Creature {
  id: string;
  name: string;
  image: string | null;
  description: string;
  location: string;
  drops: string[];
}

// ============================================================
// INCANTATIONS
// ============================================================

export interface Incantation {
  id: string;
  name: string;
  image: string | null;
  description: string;
  type: string;
  cost: number;
  slots: number;
  effects: string;
  requires: Requirement[];
}

// ============================================================
// ITEMS
// ============================================================

export interface Item {
  id: string;
  name: string;
  image: string | null;
  description: string;
  type: string;
  effect: string;
}

// ============================================================
// LOCATIONS
// ============================================================

export interface EldenLocation {
  id: string;
  name: string;
  image: string | null;
  description: string;
  region: string;
}

// ============================================================
// NPCS
// ============================================================

export interface Npc {
  id: string;
  name: string;
  image: string | null;
  quote: string | null;
  location: string;
  role: string;
}

// ============================================================
// SHIELDS
// ============================================================

export interface Shield {
  id: string;
  name: string;
  image: string | null;
  description: string;
  attack: Stat[];
  defence: Stat[];
  scalesWith: ScalesWith[];
  requiredAttributes: Requirement[];
  category: string;
  weight: number;
}

// ============================================================
// SORCERIES
// ============================================================

export interface Sorcery {
  id: string;
  name: string;
  image: string | null;
  description: string;
  type: string;
  cost: number;
  slots: number;
  effects: string;
  requires: Requirement[];
}

// ============================================================
// SPIRITS
// ============================================================

export interface Spirit {
  id: string;
  name: string;
  image: string | null;
  description: string;
  fpCost: string;
  hpCost: string;
  effect: string;
}

// ============================================================
// TALISMANS
// ============================================================

export interface Talisman {
  id: string;
  name: string;
  image: string | null;
  description: string;
  effect: string;
}

// ============================================================
// TIPOS DE RESPUESTA POR ENDPOINT (listos para usar en servicios)
// ============================================================

export type WeaponsResponse   = ApiResponse<Weapon>;
export type AmmosResponse     = ApiResponse<Ammo>;
export type ArmorsResponse    = ApiResponse<Armor>;
export type AshesResponse     = ApiResponse<Ash>;
export type BossesResponse    = ApiResponse<Boss>;
export type ClassesResponse   = ApiResponse<EldenClass>;
export type CreaturesResponse = ApiResponse<Creature>;
export type IncantationsResponse = ApiResponse<Incantation>;
export type ItemsResponse     = ApiResponse<Item>;
export type LocationsResponse = ApiResponse<EldenLocation>;
export type NpcsResponse      = ApiResponse<Npc>;
export type ShieldsResponse   = ApiResponse<Shield>;
export type SorceriesResponse = ApiResponse<Sorcery>;
export type SpiritsResponse   = ApiResponse<Spirit>;
export type TalismansResponse = ApiResponse<Talisman>;

