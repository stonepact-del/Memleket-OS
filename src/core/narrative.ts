import { narrativeEvents, type NarrativeActor, type NarrativeEventDefinition } from '../data/narrativeEvents';
import type { LifeEffect } from './lifeModel';
import type { NPC, State } from './model';
import { decision, option } from './life';
import { DAY, clamp, journal, letter, nextId } from './primitives';
import { RNG } from './rng';

const MAX_HISTORY=120;
function stage(s:State) {
  if(s.life.status==='retired') return 'retired' as const;
  return s.life.route;
}
function actorMatches(n:NPC, wanted:NarrativeActor) {
  const role=n.role.toLocaleLowerCase('tr-TR');
  if(wanted==='any') return true;
  if(wanted==='family') return role.includes('anne')||role.includes('baba')||role.includes('aile');
  if(wanted==='friend') return role.includes('arkadaş');
  if(wanted==='classmate') return role.includes('sınıf');
  if(wanted==='roommate') return role.includes('oda')||role.includes('arkadaş');
  if(wanted==='coworker') return role.includes('iş')||role.includes('arkadaş');
  return role.includes('yönetici')||role.includes('baba')||role.includes('arkadaş');
}
function chooseActor(s:State, wanted:NarrativeActor, rng:RNG) {
  const live=s.npcs.filter(n=>s.life.people[n.id]?.alive);
  const candidates=live.filter(n=>actorMatches(n,wanted));
  const pool=(candidates.length?candidates:live).sort((a,b)=>a.id.localeCompare(b.id));
  return pool.length?pool[rng.int(0,pool.length-1)]:undefined;
}
function daysSince(s:State, at?:string) { return at===undefined?Infinity:(Date.parse(s.now)-Date.parse(at))/DAY; }
function eligible(s:State, event:NarrativeEventDefinition) {
  if(!event.stages.includes(stage(s)))return false;
  // The opening school year remains a gentle onboarding stretch; authored
  // interruptions begin once the player has had time to establish a routine.
  if(stage(s)==='school'&&s.education.grade<11)return false;
  if(stage(s)==='working'&&new Date(s.now).getUTCFullYear()-new Date(s.player.birthDate).getUTCFullYear()<22)return false;
  if(s.life.decisions.some(d=>d.status==='pending'))return false;
  if(event.oneShot&&s.life.narrativeHistory.some(h=>h.id===event.id))return false;
  const own=s.life.narrativeHistory.filter(h=>h.id===event.id).at(-1);
  if(daysSince(s,own?.at)<event.cooldownDays)return false;
  return daysSince(s,s.life.narrativeHistory.at(-1)?.at)>9;
}
function weighted<T extends {weight:number}>(rng:RNG, values:T[]) {
  const total=values.reduce((sum,value)=>sum+value.weight,0); let cursor=rng.next()*total;
  for(const value of values){cursor-=value.weight;if(cursor<=0)return value;} return values.at(-1);
}
function materialize(e:LifeEffect, actor?:NPC):LifeEffect {
  return {...e,target:(e.target??'').replace('$actor',actor?.id??''),actorId:actor?.id,interaction:e.interaction};
}

/** Runs on a quiet weekly cadence. The RNG state is persisted with the life. */
export function runNarrativeDirector(s:State) {
  if(s.life.status==='ended'||daysSince(s,s.life.narrativeLastAt)<35||s.life.decisions.some(d=>d.status==='pending'))return;
  const rng=new RNG(s.rngState);
  // Calm weeks are intentional; the director only turns some weekly checks into a scene.
  if(rng.next()>.30){s.rngState=rng.state;return;}
  const chosen=weighted(rng,narrativeEvents.filter(event=>eligible(s,event)));
  if(!chosen){s.rngState=rng.state;return;}
  const actor=chooseActor(s,chosen.actor,rng);
  s.rngState=rng.state;
  const title=chosen.title;
  const description=chosen.text.replace('{actor}',actor?.name.split(' ')[0]??'yakının');
  const options=chosen.options.map(o=>option(o.id,o.label,o.description,o.effects.map(effect=>materialize(effect,actor)),o.timeMinutes??0,o.moneyCost??0));
  const created=decision(s,`narrative:${chosen.id}`,chosen.source,title,description,options,chosen.blocking,actor?[actor.id]:[]);
  if(!created)return;
  s.life.narrativeLastAt=s.now;
  s.life.narrativeHistory.push({id:chosen.id,at:s.now,actorId:actor?.id});
  s.life.narrativeHistory=s.life.narrativeHistory.slice(-MAX_HISTORY);
  journal(s,chosen.category,`${title}${actor?` · ${actor.name}`:''}`);
}

function actor(s:State,id?:string){return s.npcs.find(n=>n.id===id);}
function chat(s:State,npc:NPC,text:string){s.messages.unshift({id:nextId(s,'message'),npcId:npc.id,at:s.now,text,fromPlayer:false,read:false});s.messages=s.messages.slice(-240);}

/** A due chain is resolved exactly once by the scheduler, but its outcome still
 * depends on current state, relationship and the persisted RNG stream. */
export function resolveNarrativeFollowup(s:State, chainId:string) {
  const chain=s.life.narrativeChains[chainId]; if(!chain||chain.resolved)return;
  chain.resolved=true;
  const npc=actor(s,chain.actorId),rng=new RNG(s.rngState),roll=rng.next();s.rngState=rng.state;
  if(chainId==='classmate-support'&&npc){
    if(npc.relationship.trust>55&&roll>.22){npc.relationship.trust=clamp(npc.relationship.trust+5);chat(s,npc,'Bugün senin için hazırladığım özetleri bırakıyorum. Geçen seferki desteğini unutmadım.');journal(s,'Yakınların',`${npc.name} zor bir haftada yanında oldu.`);}
    else chat(s,npc,'Notlar işe yaradı, ama bu ara kendi telaşım çok büyük. Sonra uzun uzun konuşalım.');
  } else if(chainId==='manager-lead') {
    if(s.employment&&s.employment.performance>48&&roll>.28){s.employment.performance=clamp(s.employment.performance+7);letter(s,'career','Yönetici','Teslim fark edildi','Koordine ettiğin iş zamanında tamamlandı; katkın kayda geçti.');journal(s,'Kariyer','Küçük bir sorumluluğu sakin biçimde tamamladın.');}
    else if(s.employment){s.employment.performance=clamp(s.employment.performance-4);letter(s,'career','Yönetici','Teslim üzerine not','İş tamamlandı, ancak sonraki sefer kapsamı daha erken netleştirmek iyi olur.');}
  } else if(chainId==='friend-move'&&npc) {
    if(roll>.42){npc.goal='yeni bir şehirde düzen kurmak';npc.occupation=`${npc.occupation} · uzaktan`;chat(s,npc,'Karar verdim; taşınıyorum. Bağımızın kopmamasını istiyorum.');s.posts.unshift({id:nextId(s,'post'),npcId:npc.id,at:s.now,text:'Yeni bir şehir, eski dostlarla taşınan sohbetler.',likes:0,liked:false,comments:[]});journal(s,'Yakınların',`${npc.name} yeni bir şehirde şansını denemeye karar verdi.`);}
    else chat(s,npc,'Şimdilik kalmaya karar verdim. Bu konuşma bana iyi geldi.');
  } else if(chainId==='roommate-repair'&&npc) {
    npc.relationship.warmth=clamp(npc.relationship.warmth+(roll>.2?4:-1));chat(s,npc,roll>.2?'Mutfak düzeni gerçekten işe yaradı, teşekkür ederim.':'Düzen oturuyor ama ikimizin de biraz daha dikkat etmesi gerek.');
  } else if(chainId==='internship-opening') {
    if(roll>.35){s.life.experienceDays+=20;letter(s,'career','Kampüs ağı','Kısa uygulama kabulü','Başvurun için kısa bir uygulama günü ayarlandı.');}
  } else if(chainId==='family-support'&&npc) {
    npc.relationship.trust=clamp(npc.relationship.trust+(roll>.18?4:1));chat(s,npc,'Konuştuğumuz için sevindim. İhtiyacın olduğunda haber ver.');
  } else if(chainId==='teacher-plan') {
    s.education.consistency=clamp(s.education.consistency+(roll>.3?3:1));letter(s,'school','Rehberlik Servisi','Kısa kontrol notu','Küçük hedefler koyduğun planın ilk haftası tamamlandı.');
  }
}
