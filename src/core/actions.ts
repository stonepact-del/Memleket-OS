import type { State } from './model';
import type { Routine } from './lifeModel';
import { advanceMinutes, study, travel, applyJob, attendInterview, missInterview, decideOffer } from './simulation';
import { age, clamp, DAY, iso, journal, markProcessed, postLedger, schedule } from './primitives';
import { applyEffect, decision, housingDecision, jobUnavailable, option, optionUnavailable } from './life';
import { routines, TurkeyRuleset as rules } from '../data/turkeyRuleset';

export interface ActionRequest { id:string; target?:string; minutes?:number; mode?:string }
export interface ActionDefinition {
  id:string; label:string; description:string; minutes:number; cost:number; cooldownDays:number;
  whyUnavailable:(s:State,target?:string)=>string|undefined;
  effects:(s:State,target?:string)=>void;
}
const free=()=>undefined;
const actions:ActionDefinition[]=[
  {id:'rest',label:'Dinlen',description:'8 saat uyku; enerji +35, stres −15.',minutes:480,cost:0,cooldownDays:0,whyUnavailable:free,effects:s=>{s.player.energy=clamp(s.player.energy+35);s.player.stress=clamp(s.player.stress-15);}},
  {id:'walk',label:'Yürüyüş yap',description:'1 saat; sağlık ve ruh hali için zaman.',minutes:60,cost:0,cooldownDays:1,whyUnavailable:free,effects:s=>{s.player.health=clamp(s.player.health+1);s.player.mood=clamp(s.player.mood+5);s.player.traits.fitness=clamp(s.player.traits.fitness+1);}},
  {id:'project',label:'Bir şey üret',description:'2 saat; yaratıcılık ve özgüven geliştir.',minutes:120,cost:0,cooldownDays:1,whyUnavailable:free,effects:s=>{s.player.traits.creativity=clamp(s.player.traits.creativity+2);s.player.traits.confidence=clamp(s.player.traits.confidence+1);s.player.energy=clamp(s.player.energy-8);}},
  {id:'work',label:'İşine zaman ayır',description:'8 saat ve yol; performans +3, bir günlük deneyim. Ücret maaş gününde ödenir.',minutes:480,cost:0,cooldownDays:1,whyUnavailable:s=>!s.employment?'Önce bir iş teklifini kabul et.':s.player.energy<25?'Önce dinlen.':undefined,effects:s=>{s.employment!.performance=clamp(s.employment!.performance+3);s.life.experienceDays++;s.life.workDays++;s.player.energy=clamp(s.player.energy-18);s.player.stress=clamp(s.player.stress+5);}},
  {id:'social',label:'Birlikte zaman geçir',description:'2 saat; karşılıklı güven, yakınlık ve iyi bir anı.',minutes:120,cost:0,cooldownDays:1,whyUnavailable:(s,id)=>{const p=s.life.people[id??''];return !p?'Bir kişi seç.':!p.alive?'Bu kişi artık hatıralarında.':p.busyUntil>s.now?'Bugün meşgul; başka bir gün yeniden dene.':undefined;},effects:(s,id)=>{applyEffect(s,{kind:'relationship',target:id,value:6});const n=s.npcs.find(n=>n.id===id)!;journal(s,'Yakınların',`${n.name} ile zaman geçirdin.`);}},
  {id:'housing',label:'Yaşam yerini değiştir',description:'Kira, rahatlık ve yol süresini birlikte değerlendir.',minutes:0,cost:0,cooldownDays:0,whyUnavailable:s=>age(s)<18?'Bağımsız konut seçenekleri yetişkinlikte açılır.':undefined,effects:housingDecision},
  {id:'save-money',label:'1.000 TL biriktir',description:'Vadesiz hesabından birikimine aktar. Faiz veya getiri yok.',minutes:0,cost:rules.savingsTransfer,cooldownDays:0,whyUnavailable:free,effects:s=>{s.life.savings+=rules.savingsTransfer;}},
  {id:'withdraw',label:'Birikimden 1.000 TL kullan',description:'Birikiminden vadesiz hesabına geri aktar.',minutes:0,cost:0,cooldownDays:0,whyUnavailable:s=>s.life.savings<rules.savingsTransfer?'Birikiminde en az 1.000 TL gerekiyor.':undefined,effects:s=>{s.life.savings-=rules.savingsTransfer;postLedger(s,rules.savingsTransfer,'Birikimden hesaba aktarım','transfer');}},
  {id:'repay',label:'1.000 TL borç öde',description:'Kalan borcundan en fazla 1.000 TL kapat.',minutes:0,cost:0,cooldownDays:0,whyUnavailable:s=>!s.life.debt?'Ödenecek borcun yok.':s.balance<Math.min(s.life.debt,100000)?'Bakiye yetersiz.':undefined,effects:s=>{const amount=Math.min(s.life.debt,100000);postLedger(s,-amount,'Erken borç ödemesi','expense');s.life.debt-=amount;}},
  {id:'return-education',label:'Eğitime yeniden dön',description:'Program kaydın varsa derslerine dön; yoksa gelecek YKS’ye hazırlan.',minutes:30,cost:0,cooldownDays:1,whyUnavailable:s=>s.life.route!=='working'?'Bu seçenek eğitim dışında olduğunda açılır.':s.life.status==='retired'?'Emeklilikte bağımsız çalışmaya devam edebilirsin.':undefined,effects:s=>{
    if(s.education.program&&s.life.qualification!=='degree'){s.life.route='university';s.education.stage='university';schedule(s,'course-registration',s.now,'Yeniden ders kaydı',true);}
    else {s.life.route='preparing';s.education.stage='yks';s.life.routine='study';journal(s,'Eğitim','Yeniden YKS hazırlığına başladın. Bir sonraki başvuru dönemini bekliyorsun.');}
  }},
  {id:'transfer-program',label:'Program değişikliğini değerlendir',description:'Uygun programları karşılaştır. Tamamlanan kredilerin yarısı sayılır.',minutes:30,cost:0,cooldownDays:180,whyUnavailable:s=>s.life.route!=='university'?'Üniversite kaydı gerekiyor.':undefined,effects:s=>{
    const programs=rules.programs.filter(p=>p.id!==s.education.program&&p.threshold<=Math.max(s.life.yks.tyt,s.life.yks.ayt,s.life.yks.ydt));
    decision(s,'transfer','school','Başka bir alana geçmek', 'Kurgusal yatay geçiş: ortak kredilerin yarısı sayılır. Kararından önce süreyi düşün.',[
      ...programs.map(p=>option(p.id,p.name,'Mezuniyetin gecikebilir.',[{kind:'transfer',target:p.id}])),
      option('stay','Mevcut programda kal','Kredilerini ve düzenini koru.',[{kind:'continue'}]),
    ]);
  }},
  {id:'leave-education',label:'Eğitime ara vermeyi değerlendir',description:'Kredilerini kaybetmeden çalışma hayatına dönebilirsin.',minutes:0,cost:0,cooldownDays:0,whyUnavailable:s=>s.life.route!=='university'?'Üniversite kaydı gerekiyor.':undefined,effects:s=>decision(s,'leave','school','Eğitime ara vermek','Kaydın ve tamamladığın krediler saklanır; destek ödemesi durur.',[
    option('leave','Ara ver','İş hayatına yönel; dilediğinde geri dön.',[{kind:'leave'}]),option('stay','Öğrenime devam et','Mevcut programını sürdür.',[{kind:'continue'}]),
  ])},
  {id:'quit',label:'İşten ayrılmayı değerlendir',description:'Yeni bir yol için maaşından vazgeçmek.',minutes:0,cost:0,cooldownDays:0,whyUnavailable:s=>!s.employment?'Aktif işin yok.':undefined,effects:s=>decision(s,'quit','career','İşten ayrılmak','Maaş ödemelerin durur. Deneyimin ve birikimin seninle kalır.',[
    option('quit','İşten ayrıl','Yeni ilanlara başvurabilirsin.',[{kind:'quit'}]),option('stay','İşimi sürdür','Mevcut düzenimi koru.',[{kind:'continue'}]),
  ])},
  {id:'vehicle-maintenance',label:'Aracına bakım yaptır',description:'2 saat ve 2.500 TL; ilk aracının kondisyonu +30.',minutes:120,cost:250000,cooldownDays:30,whyUnavailable:s=>!s.vehicles.length?'Aracın yok.':undefined,effects:s=>{s.vehicles[0].condition=clamp(s.vehicles[0].condition+30);}},
  {id:'vehicle-sell',label:'Aracını sat',description:'İlk aracını kondisyonuna göre değerleyerek yerel pazara sat.',minutes:120,cost:0,cooldownDays:0,whyUnavailable:s=>!s.vehicles.length?'Aracın yok.':undefined,effects:s=>{const v=s.vehicles.shift()!;postLedger(s,Math.round(v.value*v.condition/100),`${v.title} araç satışı`,'income');journal(s,'Satın alma',`${v.title} aracını sattın.`);}},
];
export const actionDefinitions=Object.fromEntries(actions.map(a=>[a.id,a]));
export function pendingDecision(s:State) {return s.life.decisions.find(d=>d.status==='pending'&&d.blocking);}
export function actionPreview(s:State,request:ActionRequest) {
  const a=actionDefinitions[request.id];
  if(!a) return {label:request.id,description:'',minutes:0,cost:0,whyUnavailable:'Eylem bulunamadı.'};
  const blocked=pendingDecision(s);
  const cooldown=s.life.cooldowns[`${a.id}:${request.target??''}`];
  const whyUnavailable=s.life.status==='ended'?'Bu hayatın hikâyesi tamamlandı.':blocked&&a.id!=='withdraw'?`Önce kararını ver: ${blocked.title}`:a.whyUnavailable(s,request.target)??(a.cost>0&&s.balance<a.cost?'Bakiye yetersiz.':cooldown&&cooldown>s.now?'Bu eylem için biraz zaman geçmeli.':undefined);
  return {label:a.label,description:a.description,minutes:a.minutes+(a.id==='work'?s.household.housing.commute*2:0),cost:a.cost,whyUnavailable};
}
export function executeAction(s:State,request:ActionRequest) {
  const before=structuredClone(s);
  try {
    if(request.id==='study')return study(s,request.target??s.life.focus,(request.minutes??120)/60);
    if(request.id==='travel')return travel(s,request.target??'Ev',request.mode??'Yürü');
    if(request.id==='apply'){
      const reason=jobUnavailable(s,request.target??'');if(reason)throw Error(reason);
      return applyJob(s,request.target??'');
    }
    const p=actionPreview(s,request);if(p.whyUnavailable)throw Error(p.whyUnavailable);
    const a=actionDefinitions[request.id];
    const result=advanceMinutes(s,p.minutes);
    if(result.advancedMinutes<p.minutes)return result;
    // Due expenses may change affordability while the action consumes time.
    if(a.cost>0&&s.balance<a.cost)throw Error('Bu sırada bir ödeme gerçekleşti; bakiye artık yeterli değil.');
    if(a.cost)postLedger(s,-a.cost,a.label,a.id==='save-money'?'transfer':'expense');
    a.effects(s,request.target);s.life.actionMinutes+=p.minutes;
    s.life.cooldowns[`${a.id}:${request.target??''}`]=iso(Date.parse(s.now)+a.cooldownDays*DAY);
    return result;
  } catch(error) {
    Object.assign(s,before);
    throw error;
  }
}
export function setRoutine(s:State,routine:Routine) {
  if(!(routine in routines))throw Error('Geçersiz düzen');
  if(s.life.status==='ended')throw Error('Bu hayatın hikâyesi tamamlandı.');
  s.life.routine=routine;s.life.routineDays=0;
}
export function resolveDecision(s:State,id:string,optionId:string) {
  const d=s.life.decisions.find(d=>d.id===id),o=d?.options.find(o=>o.id===optionId);
  if(!d||!o)throw Error('Karar seçeneği bulunamadı');
  const reason=optionUnavailable(s,d,o);if(reason)throw Error(reason);
  const first=pendingDecision(s);if(first&&first.id!==id)throw Error(`Önce ${first.title} kararını tamamla.`);
  if(d.type==='interview'){if(o.id==='miss')missInterview(s,d.relatedEntities[0]);else attendInterview(s,d.relatedEntities[0],o.id as 'honest'|'prepared'|'confident');return;}
  if(d.type==='offer'){decideOffer(s,d.relatedEntities[0],o.id==='accept');return;}
  if(o.moneyCost)postLedger(s,-o.moneyCost,d.title,'expense');
  d.status='resolved';d.resolvedAt=s.now;d.outcome=o.label;
  if(d.type.startsWith('narrative:')){const item=s.life.narrativeHistory.findLast(h=>h.id===d.type.slice('narrative:'.length)&&h.outcome===undefined);if(item)item.outcome=o.id;}
  const ev=s.events.find(e=>e.id===d.id);if(ev)markProcessed(s,ev);
  if(d.type==='budget'&&o.id==='family'&&s.balance<0)postLedger(s,-s.balance+rules.allowance,'Yakınlarından tek seferlik toparlanma desteği','income');
  if(d.type==='promotion'&&o.id==='keep'&&s.employment)s.employment.performance=60;
  for(const effect of o.effects)applyEffect(s,effect);
  for(const followup of o.delayed){const e=schedule(s,'life-followup',iso(Date.parse(s.now)+followup.days*DAY),followup.title,true);s.life.followups[e.id]=structuredClone(followup.effects);}
  journal(s,'Karar',`${d.title}: ${o.label}`);
  const result=advanceMinutes(s,o.timeMinutes);s.life.actionMinutes+=result.advancedMinutes;
  return result;
}
export function lifeContext(s:State) {
  if(s.life.status==='ended')return 'Tamamlanmış bir hayat';
  if(s.life.status==='retired')return 'Emeklilik · yeni bir ritim';
  if(s.life.route==='school')return `${s.education.grade}. sınıf · geleceğini keşfet`;
  if(s.life.route==='preparing')return 'YKS hazırlığı · birden fazla yol';
  if(s.life.route==='university')return `Üniversite · ${s.life.semester+1}. dönem`;
  if(s.life.route==='vocational')return 'Meslek atölyesi · öğrenerek çalış';
  return s.employment?'Çalışma hayatı':'Yeni fırsatlar · Kariyer’e göz at';
}
export function nextImportantEvent(s:State) {
  return s.events.filter(e=>!e.processed&&e.important&&e.at>=s.now).sort((a,b)=>a.at.localeCompare(b.at))[0];
}
