import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Ammo,
  ApiResponse,
  Armor,
  Ash,
  Boss,
  Creature,
  EldenClass, EldenLocation,
  Incantation,
  Item, Npc, Shield, Sorcery, Spirit, Talisman,
  Weapon
} from '../common/interface';


@Injectable({
  providedIn: 'root'
})
export class EldenRingApiService {

  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = 'https://eldenring.fanapis.com/api';

  private getList<T>(
    category: string,
    page: number = 0,
    limit: number = 20,
    name?: string
  ): Observable<ApiResponse<T>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (name) {
      params = params.set('name', name);
    }

    return this.httpClient.get<ApiResponse<T>>(
      `${this.baseUrl}/${category}`, { params }
    );
  }

  private getOne<T>(category: string, id: string): Observable<T> {
    return this.httpClient.get<ApiResponse<T>>(
      `${this.baseUrl}/${category}/${id}`
    ).pipe(
      map(response => response.data[0])
    );
  }

  // ── Weapons ──────────────────────────────────────────────────────────────

  getWeapons(page?: number, limit?: number, name?: string): Observable<ApiResponse<Weapon>> {
    return this.getList<Weapon>('weapons', page, limit, name);
  }

  getOneWeapon(id: string): Observable<Weapon> {
    return this.getOne<Weapon>('weapons', id);
  }

  // ── Ammos ────────────────────────────────────────────────────────────────

  getAmmos(page?: number, limit?: number, name?: string): Observable<ApiResponse<Ammo>> {
    return this.getList<Ammo>('ammos', page, limit, name);
  }

  getOneAmmo(id: string): Observable<Ammo> {
    return this.getOne<Ammo>('ammos', id);
  }

  // ── Armors ───────────────────────────────────────────────────────────────

  getArmors(page?: number, limit?: number, name?: string): Observable<ApiResponse<Armor>> {
    return this.getList<Armor>('armors', page, limit, name);
  }

  getOneArmor(id: string): Observable<Armor> {
    return this.getOne<Armor>('armors', id);
  }

  // ── Ashes of War ─────────────────────────────────────────────────────────

  getAshes(page?: number, limit?: number, name?: string): Observable<ApiResponse<Ash>> {
    return this.getList<Ash>('ashes', page, limit, name);
  }

  getOneAsh(id: string): Observable<Ash> {
    return this.getOne<Ash>('ashes', id);
  }

  // ── Bosses ───────────────────────────────────────────────────────────────

  getBosses(page?: number, limit?: number, name?: string): Observable<ApiResponse<Boss>> {
    return this.getList<Boss>('bosses', page, limit, name);
  }

  getOneBoss(id: string): Observable<Boss> {
    return this.getOne<Boss>('bosses', id);
  }

  // ── Classes ──────────────────────────────────────────────────────────────

  getClasses(page?: number, limit?: number, name?: string): Observable<ApiResponse<EldenClass>> {
    return this.getList<EldenClass>('classes', page, limit, name);
  }

  getOneClass(id: string): Observable<EldenClass> {
    return this.getOne<EldenClass>('classes', id);
  }

  // ── Creatures ────────────────────────────────────────────────────────────

  getCreatures(page?: number, limit?: number, name?: string): Observable<ApiResponse<Creature>> {
    return this.getList<Creature>('creatures', page, limit, name);
  }

  getOneCreature(id: string): Observable<Creature> {
    return this.getOne<Creature>('creatures', id);
  }

  // ── Incantations ─────────────────────────────────────────────────────────

  getIncantations(page?: number, limit?: number, name?: string): Observable<ApiResponse<Incantation>> {
    return this.getList<Incantation>('incantations', page, limit, name);
  }

  getOneIncantation(id: string): Observable<Incantation> {
    return this.getOne<Incantation>('incantations', id);
  }

  // ── Items ────────────────────────────────────────────────────────────────

  getItems(page?: number, limit?: number, name?: string): Observable<ApiResponse<Item>> {
    return this.getList<Item>('items', page, limit, name);
  }

  getOneItem(id: string): Observable<Item> {
    return this.getOne<Item>('items', id);
  }

  // ── Locations ────────────────────────────────────────────────────────────

  getLocations(page?: number, limit?: number, name?: string): Observable<ApiResponse<EldenLocation>> {
    return this.getList<EldenLocation>('locations', page, limit, name);
  }

  getOneLocation(id: string): Observable<Location> {
    return this.getOne<Location>('locations', id);
  }

  // ── NPCs ─────────────────────────────────────────────────────────────────

  getNpcs(page?: number, limit?: number, name?: string): Observable<ApiResponse<Npc>> {
    return this.getList<Npc>('npcs', page, limit, name);
  }

  getOneNpc(id: string): Observable<Npc> {
    return this.getOne<Npc>('npcs', id);
  }

  // ── Shields ──────────────────────────────────────────────────────────────

  getShields(page?: number, limit?: number, name?: string): Observable<ApiResponse<Shield>> {
    return this.getList<Shield>('shields', page, limit, name);
  }

  getOneShield(id: string): Observable<Shield> {
    return this.getOne<Shield>('shields', id);
  }

  // ── Sorceries ────────────────────────────────────────────────────────────

  getSorceries(page?: number, limit?: number, name?: string): Observable<ApiResponse<Sorcery>> {
    return this.getList<Sorcery>('sorceries', page, limit, name);
  }

  getOneSorcery(id: string): Observable<Sorcery> {
    return this.getOne<Sorcery>('sorceries', id);
  }

  // ── Spirits ──────────────────────────────────────────────────────────────

  getSpirits(page?: number, limit?: number, name?: string): Observable<ApiResponse<Spirit>> {
    return this.getList<Spirit>('spirits', page, limit, name);
  }

  getOneSpirit(id: string): Observable<Spirit> {
    return this.getOne<Spirit>('spirits', id);
  }

  // ── Talismans ────────────────────────────────────────────────────────────

  getTalismans(page?: number, limit?: number, name?: string): Observable<ApiResponse<Talisman>> {
    return this.getList<Talisman>('talismans', page, limit, name);
  }

  getOneTalisman(id: string): Observable<Talisman> {
    return this.getOne<Talisman>('talismans', id);
  }
}
