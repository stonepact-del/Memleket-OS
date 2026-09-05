import { describe, expect, it } from 'vitest';
import { resolveDecision, pendingDecision } from './actions';
import { applyEffect, decision, option } from './life';
import { runNarrativeDirector } from './narrative';
import { advance, createLife } from './simulation';
import { MemorySaveRepository } from '../platform/saves';
import type { State } from './model';

function schoolLife(seed:number) { const s=createLife({seed});s.education.grade=11;return s; }
function scene(s:State) {
  for(let i=0;i<30&&!s.life.decisions.some(d=>d.status==='pending');i++)runNarrativeDirector(s);
  const d=s.life.decisions.find(d=>d.status==='pending');expect(d, 'an authored scene should become eligible').toBeTruthy();return d!;
}
function blockingScene(s:State) { for(let i=0;i<20;i++){const d=scene(s);if(d.blocking)return d;resolveDecision(s,d.id,d.options[0].id);s.life.narrativeLastAt=undefined;}throw Error('No blocking authored scene'); }

describe('narrative event director',()=>{
  it('selects the same authored scene from the same seed and choices',()=>{
    const a=schoolLife(901),b=schoolLife(901),da=scene(a),db=scene(b);
    expect({type:da.type,title:da.title,options:da.options.map(o=>o.id)}).toEqual({type:db.type,title:db.title,options:db.options.map(o=>o.id)});
    resolveDecision(a,da.id,da.options[0].id);resolveDecision(b,db.id,db.options[0].id);
    expect(a.life.narrativeHistory).toEqual(b.life.narrativeHistory);
  });

  it('keeps a major narrative event blocking through a long skip and reload',async()=>{
    const s=schoolLife(902),d=blockingScene(s),now=s.now;advance(s,90);expect(s.now).toBe(now);
    const repo=new MemorySaveRepository();await repo.save(s);const restored=await repo.load(s.id);
    expect(pendingDecision(restored)?.id).toBe(d.id);advance(restored,90);expect(restored.now).toBe(now);
  });

  it('keeps delayed chain consequences hidden, deterministic and exactly once',()=>{
    const s=schoolLife(903),npc=s.npcs.find(n=>n.role==='Sınıf arkadaşı')!;
    applyEffect(s,{kind:'narrative',target:'chain:start:classmate-support:2',actorId:npc.id});
    const event=s.events.find(e=>e.type==='narrative-followup')!;expect(event.requiresInput).not.toBe(true);
    advance(s,3);const messages=s.messages.filter(m=>m.npcId===npc.id).length;
    expect(s.life.narrativeChains['classmate-support'].resolved).toBe(true);advance(s,30);
    expect(s.messages.filter(m=>m.npcId===npc.id)).toHaveLength(messages);
  });

  it('records the meaning of a declined invitation rather than shared time',()=>{
    const s=schoolLife(904),npc=s.npcs[2];applyEffect(s,{kind:'interaction',target:npc.id,value:-4,interaction:'declinedInvitation'});
    expect(npc.memories.at(-1)).toMatchObject({kind:'declinedInvitation',summary:'Davetini bu kez geri çevirdin.'});
    expect(npc.memories.some(m=>m.kind==='sharedTime')).toBe(false);
  });

  it('enforces event cooldown and projects a scene into its authoritative app artifacts',()=>{
    const s=schoolLife(905),d=scene(s),history=s.life.narrativeHistory.length;
    expect(s.mails.some(m=>m.subject===d.title&&m.app===d.source)).toBe(true);
    expect(s.events.some(e=>e.id===d.id&&e.requiresInput)).toBe(true);
    for(let i=0;i<10;i++)runNarrativeDirector(s);
    expect(s.life.narrativeHistory).toHaveLength(history);
  });

  it('puts offers and interviews into the same blocking decision path',()=>{
    const s=schoolLife(906);decision(s,'offer','career','İş teklifi kararını bekliyor','Teklifin yanıtını bekliyor.',[option('decline','Reddet','Başka fırsatlara bak.',[{kind:'continue'}])],true,['application']);
    expect(pendingDecision(s)?.type).toBe('offer');expect(()=>advance(s,30)).not.toThrow();
    expect(s.now).toBe(s.life.decisions[0].createdAt);
  });
});
