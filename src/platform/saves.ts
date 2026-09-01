import Dexie, { type EntityTable } from 'dexie';
import { saveSchema, type State } from '../core/model';

export interface SaveSummary { id:string; name:string; province:string; updatedAt:string }
export interface SaveRepository { list():Promise<SaveSummary[]>; save(s:State):Promise<void>; load(id:string):Promise<State>; delete(id:string):Promise<void>; export(id:string):Promise<string>; import(raw:string):Promise<State> }

const db = new Dexie('memleketos') as Dexie & { saves:EntityTable<{id:string;data:unknown},'id'> };
db.version(1).stores({ saves:'id' });

export class IndexedDbSaveRepository implements SaveRepository {
  async list() {
    const summaries:SaveSummary[] = [];
    for (const row of await db.saves.toArray()) {
      try {
        const state = validateAndMigrate(row.data);
        summaries.push({ id:state.id, name:state.player.name, province:state.player.province, updatedAt:state.updatedAt });
      } catch {
        // Corrupt records remain untouched and are never silently deleted.
      }
    }
    return summaries.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async save(s:State) { const state = saveSchema.parse(s); await db.saves.put({ id:state.id, data:structuredClone(state) }); }
  async load(id:string) { const row=await db.saves.get(id); if(!row) throw Error('Kayıt bulunamadı'); return validateAndMigrate(row.data); }
  async delete(id:string) { await db.saves.delete(id); }
  async export(id:string) { return JSON.stringify(await this.load(id),null,2); }
  async import(raw:string) {
    let value:unknown;
    try { value=JSON.parse(raw); } catch { throw Error('Dosya geçerli JSON değil; mevcut kayıtlar korunuyor.'); }
    const state=validateAndMigrate(value);
    await this.save(state);
    return state;
  }
}

export function validateAndMigrate(value:unknown):State {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Kayıt yapısı geçersiz; dosya silinmedi.');
  const migrated = structuredClone(value) as Record<string,unknown>;
  const fail=(path:string):never=>{ throw Error(`Kayıt doğrulanamadı; dosya silinmedi: ${path}: geçersiz yapı`); };
  if (migrated.schemaVersion === 1) {
    migrated.schemaVersion=2;
    migrated.simulationVersion=migrated.simulationVersion || '0.9.0';
    if(migrated.settings===undefined)migrated.settings={sound:true,reducedMotion:false,largeText:false};
  }
  if (migrated.schemaVersion === 2) {
    if(!migrated.settings||typeof migrated.settings!=='object'||Array.isArray(migrated.settings))fail('settings');
    const posts=migrated.posts;if(!Array.isArray(posts))fail('posts');
    for(const [i,p] of (posts as unknown[]).entries()){if(!p||typeof p!=='object'||Array.isArray(p))fail(`posts.${i}`);(p as Record<string,unknown>).comments=[];}
    (migrated.settings as Record<string,unknown>).wallpaper='city';migrated.location='Ev';migrated.news=[];migrated.schemaVersion=3;
  }
  if (migrated.schemaVersion === 3) {
    const messages=migrated.messages;if(!Array.isArray(messages))fail('messages');
    for(const [i,m] of (messages as unknown[]).entries()){if(!m||typeof m!=='object'||Array.isArray(m))fail(`messages.${i}`);const x=m as Record<string,unknown>;x.read=x.fromPlayer===true;}
    const applications=migrated.applications;if(!Array.isArray(applications))fail('applications');
    for(const [i,a] of (applications as unknown[]).entries()){if(!a||typeof a!=='object'||Array.isArray(a))fail(`applications.${i}`);(a as Record<string,unknown>).statusUnread=false;}
    if(migrated.employment!==undefined){if(!migrated.employment||typeof migrated.employment!=='object'||Array.isArray(migrated.employment))fail('employment');const e=migrated.employment as Record<string,unknown>;const started=e.startedAt;if(typeof started!=='string')fail('employment.startedAt');e.nextPayAt=new Date(Date.parse(started as string)+30*864e5).toISOString();}
    migrated.schemaVersion=4;
  }
  const parsed=saveSchema.safeParse(migrated);
  if (!parsed.success) {const issue=parsed.error.issues[0],path=issue?.path.length?`${issue.path.join('.')}: `:'';throw Error(`Kayıt doğrulanamadı; dosya silinmedi: ${path}${issue?.message??'bilinmeyen hata'}`);}
  return parsed.data;
}
export class MemorySaveRepository implements SaveRepository {
  private rows=new Map<string,unknown>();
  async list() {
    const summaries:SaveSummary[]=[];
    for (const value of this.rows.values()) {
      try { const s=validateAndMigrate(value); summaries.push({id:s.id,name:s.player.name,province:s.player.province,updatedAt:s.updatedAt}); } catch { /* preserve corrupt row */ }
    }
    return summaries;
  }
  async save(s:State) { const state=saveSchema.parse(s); this.rows.set(state.id,structuredClone(state)); }
  async load(id:string) { const s=this.rows.get(id); if(!s) throw Error('Kayıt bulunamadı'); return validateAndMigrate(s); }
  async delete(id:string) { this.rows.delete(id); }
  async export(id:string) { return JSON.stringify(await this.load(id)); }
  async import(raw:string) {
    let value:unknown;
    try { value=JSON.parse(raw); } catch { throw Error('Dosya geçerli JSON değil; mevcut kayıtlar korunuyor.'); }
    const state=validateAndMigrate(value);
    await this.save(state);
    return state;
  }
}
export const saves=new IndexedDbSaveRepository();
