import { describe, expect, it } from 'vitest';
import { advance, createLife, postLedger } from './simulation';
import { executeAction, pendingDecision, resolveDecision, setRoutine } from './actions';
import { optionUnavailable } from './life';
import { saveSchema } from './model';
import { MemorySaveRepository, validateAndMigrate } from '../platform/saves';
import { age } from './primitives';
import type { State } from './model';

function choose(s:State, prefer:string[]=[]){
  const d=pendingDecision(s);if(!d)return;
  const selected=prefer.map(id=>d.options.find(o=>o.id===id)).find(o=>o&&!optionUnavailable(s,d,o))??d.options.find(o=>!optionUnavailable(s,d,o));
  if(!selected)throw Error(`No recovery option: ${d.type}`);
  resolveDecision(s,d.id,selected.id);
}
function until(s:State,predicate:()=>boolean,prefer:string[]=[],max=1000){
  for(let i=0;i<max&&!predicate();i++){if(pendingDecision(s))choose(s,prefer);else advance(s,90);saveSchema.parse(s);}
  expect(predicate()).toBe(true);
}
describe('playable life progression',()=>{
  it('keeps a blocking school decision unresolved across arbitrary skips and reload',async()=>{
    const s=createLife({seed:12});advance(s,365);const d=pendingDecision(s)!;expect(d.type).toBe('direction');const now=s.now;
    advance(s,900);expect(s.now).toBe(now);expect(d.status).toBe('pending');
    const repo=new MemorySaveRepository();await repo.save(s);const loaded=await repo.load(s.id);advance(loaded,900);expect(loaded.now).toBe(now);
    resolveDecision(loaded,d.id,'science');advance(loaded,1);expect(loaded.now>now).toBe(true);
    expect(()=>resolveDecision(loaded,d.id,'science')).toThrow();
  });
  it('reaches university, completes courses, internship and graduation through scheduled choices',()=>{
    const s=createLife({seed:21});setRoutine(s,'study');
    until(s,()=>s.life.route==='university',['science','register','attend','software','enroll']);
    expect(s.life.yks.attempts).toBe(1);expect(s.life.yks.preferences[0]).toBe('software');
    until(s,()=>s.life.qualification==='degree',['standard','family','grant','join']);
    expect(s.education.credits).toBeGreaterThanOrEqual(240);expect(s.education.stage).toBe('graduated');expect(s.life.internship).toBe(true);
    expect(s.archive.some(e=>e.text.includes('mezunusun'))).toBe(true);
  });
  it('recovers from weak YKS performance through vocational training and later education',()=>{
    const s=createLife({seed:22});setRoutine(s,'work');
    for(const key of Object.keys(s.education.knowledge))s.education.knowledge[key]=0;s.education.consistency=0;
    until(s,()=>pendingDecision(s)?.type==='path',['science','register','attend']);
    expect(s.life.yks.tyt).toBeLessThan(42);choose(s,['vocational']);setRoutine(s,'balanced');
    until(s,()=>s.life.qualification==='vocational');expect(s.life.experienceDays).toBeGreaterThanOrEqual(120);
    executeAction(s,{id:'return-education'});expect(s.life.route).toBe('preparing');
  });
  it('rejects insufficient funds and unavailable job requirements without changing state',()=>{
    const s=createLife({seed:30});s.balance=0;const before=structuredClone(s);
    expect(()=>executeAction(s,{id:'save-money'})).toThrow(/Bakiye/);expect(s).toEqual(before);
    expect(()=>executeAction(s,{id:'apply',target:'job-14'})).toThrow();expect(s).toEqual(before);
  });
  it('does not grant a full action effect when a decision interrupts its duration',()=>{
    const s=createLife({seed:30});s.events.push({id:'manual',at:new Date(Date.parse(s.now)+30*60000).toISOString(),type:'test',title:'Karar',important:true,requiresInput:true});
    const health=s.player.health;const result=executeAction(s,{id:'walk'});expect(result?.advancedMinutes).toBe(30);expect(s.player.health).toBe(health);
  });
  it('runs the same complete life twice with bounded histories, retirement, closure and balanced ledger',()=>{
    const a=createLife({seed:23}),b=createLife({seed:23});
    for(const s of [a,b]){
      until(s,()=>s.life.status==='ended',['science','alternative','work','family','retire','people'],1500);
      expect(age(s)).toBeGreaterThanOrEqual(82);expect(s.life.retiredAt).toBeDefined();
      expect(s.events.length).toBeLessThan(200);expect(s.messages.length).toBeLessThanOrEqual(240);expect(s.ledger.length).toBeLessThanOrEqual(600);
      expect(s.life.ledgerArchive.net+s.ledger.reduce((sum,t)=>sum+t.amount,0)).toBe(s.balance);
      expect(s.npcs.some(n=>n.lifeStage==='hatıralarda')).toBe(true);
      const now=s.now;advance(s,30);expect(s.now).toBe(now);
    }
    expect(a).toEqual(b);
  }, 20000);
  it('preserves complete money transfers and validates a save between actions',()=>{
    const s=createLife({seed:32});postLedger(s,100000,'Test income','income');const total=s.balance;
    executeAction(s,{id:'save-money'});const loaded=validateAndMigrate(JSON.parse(JSON.stringify(s)));
    expect(loaded.balance+loaded.life.savings).toBe(total);executeAction(loaded,{id:'withdraw'});expect(loaded.balance).toBe(total);expect(loaded.life.savings).toBe(0);
  });
});
