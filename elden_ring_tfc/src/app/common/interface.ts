/* Interfaz de usuario autenticado */
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

/* Respuesta del endpoint de login: token JWT + datos del usuario */
export interface LoginResponse {
  status: number;
  message: string;
  user: User;
  token: string;
}

/* Respuesta del endpoint de registro */
export interface RegisterResponse {
  status: number;
  message: string;
}

/* Credenciales enviadas al endpoint de login */
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

/* Datos enviados al endpoint de registro */
export interface RegisterCredentials {
  name?: string;
  surnames?: string;
  birth_date?: string;
  email?: string;
  username?: string;
  password?: string;
}

/* INTERFACES GENÉRICAS (respuesta base de la API) */

export interface ApiResponse<T> {
  success: boolean;
  count: number;
  total: number;
  data: T[];
}

/* INTERFACES COMPARTIDAS */

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

/* WEAPONS */

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

/* AMMOS */

export interface Ammo {
  id: string;
  name: string;
  image: string | null;
  description: string;
  type: string;
  attackPower: Stat[];
  passive: string;
}

/* ARMORS */

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

/* ASHES OF WAR */

export interface Ash {
  id: string;
  name: string;
  image: string | null;
  description: string;
  affinity: string;
  skill: string;
}

/* BOSSES */

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

/* CLASSES */

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

/* CREATURES */

export interface Creature {
  id: string;
  name: string;
  image: string | null;
  description: string;
  location: string;
  drops: string[];
}

/* INCANTATIONS */

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

/* ITEMS */

export interface Item {
  id: string;
  name: string;
  image: string | null;
  description: string;
  type: string;
  effect: string;
}

/* LOCATIONS */

export interface EldenLocation {
  id: string;
  name: string;
  image: string | null;
  description: string;
  region: string;
}

/* NPCS */

export interface Npc {
  id: string;
  name: string;
  image: string | null;
  quote: string | null;
  location: string;
  role: string;
}

/* SHIELDS */

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

/* SORCERIES */

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

/* SPIRITS */

export interface Spirit {
  id: string;
  name: string;
  image: string | null;
  description: string;
  fpCost: string;
  hpCost: string;
  effect: string;
}

/* TALISMANS */

export interface Talisman {
  id: string;
  name: string;
  image: string | null;
  description: string;
  effect: string;
}

export interface Favorite {
  id_favorite?: number;
  id_user?: number;
  api_id: string;
  category: string;
  name: string;
  image: string | null;
  subcategory?: string | null;
}

export interface Team {
  id_team?: number;
  id_user?: number;
  name?: string;
  is_active?: number;
  weapon_r1: string | null;
  weapon_r2: string | null;
  weapon_r3: string | null;
  weapon_l1: string | null;
  weapon_l2: string | null;
  weapon_l3: string | null;
  arrow1: string | null;
  arrow2: string | null;
  bolt1: string | null;
  bolt2: string | null;
  armor_head:  string | null;
  armor_chest: string | null;
  armor_hands: string | null;
  armor_legs:  string | null;
  talisman1: string | null;
  talisman2: string | null;
  talisman3: string | null;
  talisman4: string | null;
  item1:  string | null;
  item2:  string | null;
  item3:  string | null;
  item4:  string | null;
  item5:  string | null;
  item6:  string | null;
  item7:  string | null;
  item8:  string | null;
  item9:  string | null;
  item10: string | null;
  ash1: string | null;
  ash2: string | null;
  ash3: string | null;
  spell1: string | null;
  spell2: string | null;
  spell3: string | null;
  spell4: string | null;
  spell5: string | null;
}

/* TIPOS DE RESPUESTA POR ENDPOINT (listos para usar en servicios) */

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
