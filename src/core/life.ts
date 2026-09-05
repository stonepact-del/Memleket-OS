import type { GameEvent, State } from './model';
import type { Decision, DecisionOption, LifeEffect, Routine } from './lifeModel';
import { TurkeyRuleset as rules } from '../data/turkeyRuleset';
import { hashSeed, RNG } from './rng';
import { age, clamp, DAY, iso, journal, letter, markProcessed, nextId, postLedger, schedule } from './primitives';
import { futureDate } from './lifeSetup';

export function option(id:string,label:string,description:string,effects:LifeEffect[], timeMinutes=0,moneyCost=0,eligibility:DecisionOption['eligibility']='always'):DecisionOption {
  return {id,label,description,effects,timeMinutes,moneyCost,eligibility,delayed:[]};
}
export function decision(s:State,type:string,source:Decision['source'],title:string,description:string,options:DecisionOption[],blocking=true,relatedEntities:string[]=[]) {
  if(s.life.decisions.some(d=>d.type===type&&d.status==='pending'))return;
  const event=schedule(s,'decision',s.now,title,true);
  event.requiresInput=blocking;
  const d:Decision={id:event.id,type,source,title,description,options,blocking,relatedEntities,createdAt:s.now,severity:blocking?'important':'ordinary',status:'pending'};
  if(!blocking){d.deadline=iso(Date.parse(s.now)+3*DAY);schedule(s,'decision-expiry',d.deadline,title,false,[d.id]);}
  s.life.decisions.push(d); letter(s,source,'Hayatın akışı',title,description);
  return d;
}
export function programScore(s:State,id:string) {
  const p=rules.programs.find(p=>p.id===id);
  return p?.field==='tyt'?s.life.yks.tyt:p?.field==='language'?s.life.yks.ydt:Math.round((s.life.yks.tyt+s.life.yks.ayt)/2);
}
export function availablePrograms(s:State) { return rules.programs.filter(p=>programScore(s,p.id)>=p.threshold); }
export function jobUnavailable(s:State,jobId:string):string|undefined {
  const j=s.jobs.find(j=>j.id===jobId); if(!j)return 'İlan bulunamadı.';
  if(s.life.status!=='living')return 'Çalışma hayatın kapalı.';
  if(j.workType==='Tam zamanlı'&&age(s)<18)return 'Bu rol yetişkinler için.';
  if(j.education==='Üniversite mezunu'&&s.life.qualification!=='degree')return 'Üniversite mezuniyeti gerekiyor.';
  if(j.education==='Lise mezunu'&&s.life.qualification==='none')return 'Önce liseyi tamamla.';
  if(j.education==='Mesleki yeterlilik'&&!['vocational','degree'].includes(s.life.qualification))return 'Mesleki eğitim veya üniversite mezuniyeti gerekiyor.';
  if(s.life.experienceDays<j.experience)return `${j.experience} iş günü deneyim gerekiyor.`;
}
export function optionUnavailable(s:State,d:Decision,o:DecisionOption):string|undefined {
  if(d.status!=='pending')return 'Bu karar zaten tamamlandı.';
  if(s.life.status==='ended')return 'Bu hayatın hikâyesi tamamlandı.';
  if(o.moneyCost>0&&o.moneyCost>s.balance)return 'Bakiye yetersiz; ücretsiz yolu seçebilir veya birikimini kullanabilirsin.';
  if(o.eligibility==='adult'&&age(s)<18)return 'Yetişkinlikte kullanılabilir.';
  if(o.eligibility==='student'&&s.life.route!=='university')return 'Üniversite kaydı gerekiyor.';
  if(o.eligibility==='employed'&&!s.employment)return 'Çalışıyor olman gerekiyor.';
  if(o.eligibility==='degree'&&s.life.qualification!=='degree')return 'Mezuniyet gerekiyor.';
  const program=o.effects.find(e=>e.kind==='enroll')?.target;
  if(program&&!availablePrograms(s).some(p=>p.id===program))return 'Bu sonuçla yerleşemiyorsun.';
}
export function stopEmployment(s:State) {
  for(const e of s.events.filter(e=>!e.processed&&['salary','shift'].includes(e.type)))markProcessed(s,e);
  s.employment=undefined; s.life.workDays=0;
}
export function housingDecision(s:State) {
  decision(s,'housing','market','Nerede yaşayacaksın?','Evin giderlerini, yol süreni ve günlük rahatlığını değiştirir. Ailene dönmek her zaman mümkün.',
    Object.entries(rules.housing).map(([id,h])=>option(id,h.label,`Aylık kira ${(h.rent/100).toLocaleString('tr-TR')} TL; yol ${h.commute} dk. Taşınma için depozito gerekir.`,[{kind:'housing',target:id}],120,h.deposit,id==='dorm'?'student':id==='family'?'always':'adult')));
}
function routeDecision(s:State) {
  decision(s,'path','school','Önünde birden fazla yol var','Bir sınav bütün hayatını belirlemez. Çalışabilir, meslek öğrenebilir veya gelecek sınava hazırlanabilirsin.',[
    option('retry','YKS’ye hazırlan','Gelecek başvuru dönemini takvimine al. Ücret yok.',[{kind:'routine',target:'study'},{kind:'registerYks',target:'next'}]),
    option('vocational','Meslek öğren','Bir yıllık uygulamalı eğitim; ardından teknik işlere başvurabilirsin.',[{kind:'vocational'}]),
    option('work','Çalışma hayatına geç','Kariyer’de uygun ilanları incele. Daha sonra YKS’ye dönebilirsin.',[{kind:'working'}]),
  ]);
}
function courseDecision(s:State) {
  if(s.life.route!=='university')return;
  decision(s,'courses','school',`${s.life.semester+1}. dönem ders kaydı`,'Ders yükünü iş ve sosyal hayatınla birlikte düşün. Başarısız dersler için tekrar fırsatın var.',[
    option('standard','Tam dönem · 30 kredi','Dört ders; mezuniyet yolunda düzenli ilerleme.',[{kind:'courses',target:'standard'}],30),
    option('light','Hafif dönem · 15 kredi','İki ders; iş ve dinlenmeye daha çok zaman, daha geç mezuniyet.',[{kind:'courses',target:'light'}],30),
    option('leave','Eğitime ara ver','Kredilerin saklanır. Okulum’dan yeniden kayıt isteyebilirsin.',[{kind:'leave'}]),
  ]);
}
export function applyEffect(s:State,e:LifeEffect) {
  const l=s.life;
  switch(e.kind){
    case 'routine': l.routine=e.target as Routine; break;
    case 'direction': l.direction=e.target as typeof l.direction; l.focus=e.target==='language'?'YabancıDil':e.target==='social'?'Sosyal':'Matematik'; break;
    case 'registerYks': {
      l.route='preparing';
      if(e.target==='next'){s.education.stage='yks';break;}
      const year=new Date(s.now).getUTCFullYear(); l.yks.registeredYear=year;
      schedule(s,'yks-attendance',iso(Date.UTC(year,rules.yks.examMonth,rules.yks.examDay,8)),'YKS sınav günü',true);
      journal(s,'Eğitim',`${year} YKS başvurusunu tamamladın.`); break;
    }
    case 'takeYks': {
      const r=new RNG(s.rngState),k=s.education.knowledge,avg=Object.values(k).reduce((a,b)=>a+b,0)/Object.keys(k).length;
      const readiness=s.education.consistency*.14+s.player.traits.academicAbility*.12-s.player.stress*.06;
      l.yks.tyt=clamp(Math.round(avg*.76+readiness+r.int(-5,5)));
      l.yks.ayt=clamp(Math.round((l.direction==='science'?(k.Matematik+k.Fen)/2:(k.Türkçe+k.Sosyal)/2)*.78+readiness+r.int(-5,5)));
      l.yks.ydt=clamp(Math.round(k.YabancıDil*.8+readiness+r.int(-5,5)));
      l.yks.attempts++; l.yks.resultYear=new Date(s.now).getUTCFullYear(); s.rngState=r.state;
      schedule(s,'yks-results',iso(Date.parse(s.now)+7*DAY),'YKS sonuçları ve tercihler',true); break;
    }
    case 'skipYks': journal(s,'Eğitim','Sınava katılmadın. Yeni bir başlangıç için başka yolların var.');routeDecision(s);break;
    case 'preferences': {
      l.yks.preferences=(e.target??'').split(',').filter(Boolean);
      schedule(s,'placement',iso(Date.parse(s.now)+7*DAY),'Yerleştirme sonucu',true);break;
    }
    case 'enroll': {
      const p=rules.programs.find(p=>p.id===e.target)!;
      if(!p)throw Error('Program bulunamadı');
      s.education.program=p.id;s.education.school=p.name;s.education.stage='university';l.route='university';l.semester=0;l.termEffort=0;s.education.credits=0;
      journal(s,'Eğitim',`${p.name} programına yerleştin.`);courseDecision(s);housingDecision(s);
      decision(s,'student-support','bank','Öğrenci bütçen','Bu desteklerin tamamı kurgusal oyun koşullarıdır; gerçek bir hak veya başvuru değildir.',[
        option('grant','Kampüs bursu','Aylık 3.600 TL; derslerini sürdürdüğün sürece.',[{kind:'support',target:'grant'}]),
        option('loan','Öğrenci borç desteği','Aylık 5.000 TL borç; çalışma hayatında geri ödersin. Faiz yok.',[{kind:'support',target:'loan'}]),
        option('none','Destek alma','Harçlığın, birikimin ve iş gelirinle devam et.',[{kind:'support',target:'none'}]),
      ]);break;
    }
    case 'vocational': l.route='vocational';s.education.stage='graduated';l.termEffort=0;s.education.school='Mahalle Meslek Atölyesi';schedule(s,'vocational-end',iso(Date.parse(s.now)+365*DAY),'Mesleki yeterlilik değerlendirmesi',true);journal(s,'Eğitim','Meslek atölyesinde uygulamalı eğitime başladın.');break;
    case 'working': l.route='working';s.education.stage='graduated';l.routine='balanced';journal(s,'Kariyer','Çalışma hayatına yöneldin. Öğrenmeye dönmek için kapın açık.');break;
    case 'courses': {
      const p=rules.programs.find(p=>p.id===s.education.program)??rules.programs[3];
      l.studyLoad=e.target==='light'?'light':'standard';l.courses=p.subjects.slice(0,l.studyLoad==='light'?2:4).map((name,i)=>({id:`term-${l.semester+1}-${i}`,name,credits:i%2?7:8,score:0,passed:false}));l.termEffort=0;
      schedule(s,'semester-end',iso(Date.parse(s.now)+150*DAY),'Dönem sınavları',true);break;
    }
    case 'leave': l.route='working';s.education.stage='graduated';l.support='none';for(const ev of s.events.filter(ev=>!ev.processed&&['semester-end','course-registration'].includes(ev.type)))markProcessed(s,ev);journal(s,'Eğitim','Üniversiteye ara verdin. Tamamladığın krediler arşivinde duruyor.');break;
    case 'transfer': s.education.program=e.target;s.education.school=rules.programs.find(p=>p.id===e.target)!.name; s.education.credits=Math.floor(s.education.credits/2);journal(s,'Eğitim','Program değiştirdin; ortak derslerin yarısı sayıldı (oyun kuralı).');break;
    case 'housing': {
      const h=rules.housing[e.target as keyof typeof rules.housing];if(!h)throw Error('Konut bulunamadı');
      Object.assign(s.household.housing,{kind:h.label,rent:h.rent,costs:h.costs,quality:h.quality,commute:h.commute});s.location='Ev';journal(s,'Ev',`${h.label} yaşamaya başladın.`);break;
    }
    case 'support': l.support=e.target as typeof l.support;break;
    case 'debt': {
      const amount=Math.max(0,e.value??0); if(l.debt+amount>rules.debtLimit)throw Error('Borç sınırına ulaştın'); l.debt+=amount;postLedger(s,amount,'Kurgusal dayanışma borcu','income');break;
    }
    case 'relationship': {
      const n=s.npcs.find(n=>n.id===e.target);if(!n)break;
      n.relationship.warmth=clamp(n.relationship.warmth+(e.value??5));n.relationship.trust=clamp(n.relationship.trust+(e.value??5)/2);
      n.relationship.tension=clamp(n.relationship.tension-(e.value??5)); l.people[n.id].lastContact=s.now;
      n.memories.push({id:nextId(s,'memory'),at:s.now,kind:'sharedTime',summary:'Birbirinize zaman ayırdınız.',impact:e.value??5});n.memories=n.memories.slice(-20);s.player.social=clamp(s.player.social+8);break;
    }
    case 'promotion': if(s.employment){const j=s.jobs.find(j=>j.id===s.employment!.jobId)!;j.salary=Math.min(12000000,Math.round(j.salary*1.18));l.careerLevel++;s.employment.performance=60;journal(s,'Kariyer',`${j.position} rolünde sorumluluk ve ücretin arttı.`);}break;
    case 'quit': stopEmployment(s);journal(s,'Kariyer','İşinden ayrıldın. Deneyimin sonraki başvurularında seninle.');break;
    case 'retire': {
      const j=s.jobs.find(j=>j.id===s.employment?.jobId);l.pension=Math.min(rules.retirement.maximumPension,Math.max(rules.retirement.minimumPension,Math.round((j?.salary??1500000)*.5)+Math.min(600000,l.experienceDays*40)));
      stopEmployment(s);l.status='retired';l.retiredAt=s.now;l.routine='social';journal(s,'Hayat','Emekliliğe adım attın. Şimdi kendine, sevdiklerine ve paylaşacaklarına daha çok zaman var.');break;
    }
    case 'continue': break;
    case 'legacy': l.legacy=e.target??'Yakınlarınla paylaştığın anlar';journal(s,'Hatıra',l.legacy);s.player.mood=clamp(s.player.mood+8);break;
    case 'wellbeing': s.player.energy=clamp(s.player.energy+15);s.player.stress=clamp(s.player.stress-15);s.player.health=clamp(s.player.health+4);break;
    case 'internship': l.internship=true;l.experienceDays+=60;journal(s,'Kariyer','Kampüs projesinde stajını tamamladın; 60 günlük uygulama deneyimi kazandın.');break;
    case 'followup': journal(s,'Hayat',e.target??'Önceki kararının etkisi hayatında yer buldu.');break;
  }
}
function dailyRoutine(s:State) {
  const l=s.life,r=l.routine,p=s.player;
  l.dayCount++;l.routineDays++;
  const weekday=new Date(s.now).getUTCDay(),workingDay=weekday!==0&&weekday!==6;
  const season=new Date(s.now).getUTCMonth(),schoolDay=workingDay&&(season<6||season>=8);
  const enrolled=['school','university','vocational','preparing'].includes(l.route);
  const busy=Math.min(1,l.actionMinutes/480);l.actionMinutes=0;l.lastActionDay=s.now.slice(0,10);
  if(enrolled&&(schoolDay||l.route==='preparing')){
    const effective=(r==='study'?1:r==='work'?.12:r==='health'?.3:.5)*(1-busy*.6);
    for(const subject of Object.keys(s.education.knowledge)){
      const cap=r==='study'?96: r==='work'?54:80;
      const current=s.education.knowledge[subject];
      s.education.knowledge[subject]=clamp(current+(cap-current)*.003*effective*(subject===l.focus?2:1));
    }
    l.termEffort=clamp(l.termEffort+effective*.7);
    s.education.consistency=clamp(s.education.consistency+(r==='study'?.12:r==='work'?-.1:.02));
    s.education.attendance=clamp(s.education.attendance+(r==='work'?-.15:.03));
  }
  if(s.employment&&workingDay){
    l.experienceDays++;l.workDays++;
    const performance=r==='work'?.18:r==='study'?-.16:r==='health'?-.2:.04;
    s.employment.performance=clamp(s.employment.performance+performance-busy*.2);
  }
  const targetEnergy=r==='study'?58:r==='work'?55:r==='health'?90:76;
  const targetStress=r==='study'?48:r==='work'?52:r==='health'?12:24;
  p.energy=clamp(p.energy+(targetEnergy-p.energy)*.08);
  p.stress=clamp(p.stress+(targetStress-p.stress)*.04);
  p.mood=clamp(p.mood+((r==='social'?85:70)-p.mood)*.03);
  p.social=clamp(p.social+((r==='social'?88:r==='work'||r==='study'?44:70)-p.social)*.03);
  if(r==='health'){p.health=clamp(p.health+.015);p.traits.fitness=clamp(p.traits.fitness+.02);}
  if(r==='creative')p.traits.creativity=clamp(p.traits.creativity+.025);
  if(r==='study')p.traits.discipline=clamp(p.traits.discipline+.01);
  if(r==='social')p.traits.socialSkill=clamp(p.traits.socialSkill+.015);
  // Planned travel is part of the day's routine, and its time/comfort affects recovery.
  p.energy=clamp(p.energy-s.household.housing.commute*.002);
  schedule(s,'life-day',iso(Date.parse(s.now)+DAY),'Günlük düzen');
}
function monthlyLife(s:State) {
  const l=s.life,student=['school','preparing','university','vocational'].includes(l.route);
  if(student&&!s.employment&&age(s)<26)postLedger(s,rules.allowance,'Aileden aylık destek','income');
  if(l.status==='retired')postLedger(s,l.pension,'Kurgusal emeklilik geliri','income');
  if(l.route==='university'&&l.support==='grant')postLedger(s,rules.studentGrant,'Kampüs bursu','income');
  if(l.route==='university'&&l.support==='loan'&&l.debt+rules.studentLoan<=rules.debtLimit){l.debt+=rules.studentLoan;postLedger(s,rules.studentLoan,'Öğrenci borç desteği','income');}
  const h=s.household.housing;
  const total=h.kind==='Aileyle'?rules.transportCost:h.rent+h.costs+rules.livingCost+rules.transportCost;
  postLedger(s,-total,h.kind==='Aileyle'?'Aylık ulaşım ve kişisel gider':'Kira, ev, ulaşım ve yaşam giderleri','expense');
  if(l.debt&&l.route!=='university'&&s.balance>rules.debtRepayment){const pay=Math.min(l.debt,rules.debtRepayment);postLedger(s,-pay,'Borç taksiti','expense');l.debt-=pay;}
  for(const v of s.vehicles){v.condition=clamp(v.condition-1);postLedger(s,-40000,`${v.title} aylık araç gideri`,'expense');}
  if(s.balance<0&&!l.decisions.some(d=>d.type==='budget'&&d.status==='pending')){
    const shortfall=-s.balance+rules.allowance;
    decision(s,'budget','bank','Bütçen sıkıştı','Giderler bakiyeni aştı. Yaşam koşullarını değiştirerek toparlanabilirsin.',[
      option('family','Aileye dön ve giderleri azalt','Kira yükünü bırak. Açığın dayanışma desteğiyle kapanır; bir sonraki ayı yeniden planla.',[{kind:'housing',target:'family'},{kind:'followup',target:'Yakınlarının desteğiyle bütçeni yeniden kurdun.'}]),
      ...(l.debt+shortfall<=rules.debtLimit?[option('borrow','Dayanışma borcu al','Açığını kapat; çalışırken aylık 1.000 TL geri öde. Faiz yok.',[{kind:'debt',value:shortfall}])]:[]),
    ]);
  }
  if(s.employment){
    if(s.employment.performance>=78&&!l.decisions.some(d=>d.type==='promotion'&&d.status==='pending'))decision(s,'promotion','career','Yeni bir sorumluluk','Yöneticin katkını fark etti. Daha yüksek ücretle yeni sorumluluk alabilirsin.',[
      option('accept','Sorumluluğu kabul et','Ücretin %18 artar. Yeni görevinde yeniden deneyim kazanırsın.',[{kind:'promotion'}],60),
      option('keep','Şimdilik mevcut görevimde kal','Düzenini koru; ileride yeniden değerlendirilirsin.',[{kind:'continue'}]),
    ]);
    if(s.employment.performance<18){stopEmployment(s);journal(s,'Kariyer','İş ilişkisi sona erdi. Kazandığın deneyim yeni başvurularında geçerli.');letter(s,'career','İşveren','İşten ayrılış','Performans beklentileri karşılanmadı. Yeni ilanlara başvurabilir veya eğitimine dönebilirsin.');}
  }
  const year=new Date(s.now).getUTCFullYear(),month=new Date(s.now).getUTCMonth();
  for(const n of s.npcs){
    const person=l.people[n.id];if(!person?.alive)continue;
    n.age=year-person.birthYear;
    if(n.age>=86+hashSeed(n.id)%9){person.alive=false;n.lifeStage='hatıralarda';journal(s,'Yakınların',`${n.name} uzun hayatının sonunda aranızdan ayrıldı. Birlikte yaşadıklarınız sende kalıyor.`);continue;}
    if(n.age<18){n.lifeStage='ergenlik';n.occupation='Öğrenci';}
    else if(n.age<23){n.lifeStage='genç yetişkin';n.occupation=hashSeed(n.id)%2?'Üniversite öğrencisi':'Atölye çalışanı';}
    else if(n.age<60){n.lifeStage='yetişkinlik';n.occupation=hashSeed(n.id)%2?'Uzman':'Esnaf';}
    else {n.lifeStage='emeklilik';n.occupation='Emekli';}
    const daysSince=(Date.parse(s.now)-Date.parse(person.lastContact))/DAY;
    n.relationship.warmth=clamp(n.relationship.warmth-(daysSince>60?1:0)+(l.routine==='social'?1:0));
    if(n.closeness==='close'&&n.relationship.warmth<35)n.closeness='relevant';
    else if(n.relationship.warmth>70)n.closeness='close';
    person.busyUntil=iso(Date.parse(s.now)+(hashSeed(`${n.id}-${month}-${year}`)%5)*DAY);
    if(n.role.includes('arkadaş')||n.role==='Arkadaş'){
      const text=n.age<18?'Bu ay dersler yoğun. Birlikte kısa bir yürüyüş iyi gelir.':n.age<23?`Yeni düzenime alışıyorum: ${n.occupation.toLocaleLowerCase('tr-TR')}. Bir ara görüşelim.`:n.age<60?'İş ve ev arasında zaman hızlı geçiyor. Seni de görmek isterim.':'Bugün eski fotoğraflara baktım. Birlikte çay içelim mi?';
      s.posts.unshift({id:nextId(s,'post'),npcId:n.id,at:s.now,text,likes:0,liked:false,comments:[]});
      if(month%3===hashSeed(n.id)%3)decision(s,`invite-${n.id}`,'chat',`${n.name.split(' ')[0]}’dan davet`,text,[
        option('meet','Birlikte zaman geçir','İki saat yürüyüş ve sohbet. Güven ve yakınlık artar.',[{kind:'relationship',target:n.id,value:8}],120),
        option('later','Bu kez başka zamana bırak','Programını koru. Küçük bir mesafe oluşabilir.',[{kind:'relationship',target:n.id,value:-2}]),
      ],false,[n.id]);
    }
  }
  for(const c of s.companies){const move=(hashSeed(`${c.id}-${year}-${month}`)%9)-4;c.price=Math.max(100,Math.min(1000000,Math.round(c.price*(100+move)/100)));c.priceHistory=[...c.priceHistory,c.price].slice(-24);c.hiringDemand=clamp(c.hiringDemand+move);}
  const c=s.companies[(year+month)%s.companies.length];
  s.news.unshift({id:nextId(s,'news'),at:s.now,category:'Ekonomi',title:`${c.name}: yerel iş görünümü`,body:`${c.name} için bu ay işe alım talebi ${Math.round(c.hiringDemand)}/100. Bu kurgusal değişim başvuru fırsatlarını etkiliyor.`,companyId:c.id});
  schedule(s,'life-month',iso(Date.UTC(year,month+1,2,8)),'Aylık bütçe ve yaşam');
}
function annualLife(s:State) {
  const a=age(s);
  if(a>=rules.retirement.age&&s.life.status==='living')decision(s,'retirement','archive','Yeni bir yaşam ritmi','Bu senaryoda emeklilik, çalışma deneyimini ve gelirini daha sakin bir döneme taşır. Gerçek mevzuat değildir.',[
    option('retire','Emekliliğe geç','İşten ayrıl; aylık kurgusal emeklilik geliri başlasın.',[{kind:'retire'}]),
    option('continue','Bir yıl daha çalışmayı sürdür','Bu kararı gelecek yıl yeniden düşün.',[{kind:'continue'}]),
  ]);
  else if(a>=25&&a%5===0)decision(s,'chapter','archive',`${a} yaşında hayatına bakarken`,'Zaman içinde biriktirdiklerin yalnızca para değil. Önümüzdeki dönemde neye yer açmak istersin?',[
    option('people','Yakınlarıma daha çok zaman','Sosyal bir ritim kur. Arkadaşlıklar günlük hayatında yeniden yer bulsun.',[{kind:'routine',target:'social'},{kind:'legacy',target:'Sevdiklerin için zaman ayırmayı seçtin.'}]),
    option('create','Öğrendiklerimi paylaş','Yaratıcılığına ve deneyimini aktarmaya yer aç.',[{kind:'routine',target:'creative'},{kind:'legacy',target:'Deneyimini paylaşarak başkalarının yoluna ışık tuttun.'}]),
    option('health','Daha sakin bir düzen','Sağlığına ve dinlenmeye öncelik ver.',[{kind:'routine',target:'health'},{kind:'legacy',target:'Kendi ritmini bulmayı öğrendin.'}]),
  ]);
  schedule(s,'life-year',futureDate(s,8,1,7),'Yeni bir dönem',true);
}
export function processLifeEvent(s:State,e:GameEvent):boolean {
  switch(e.type){
    case 'life-day': dailyRoutine(s);return true;
    case 'life-month': monthlyLife(s);return true;
    case 'life-year': annualLife(s);return true;
    case 'school-year': {
      if(s.life.route==='school'||s.education.stage==='highSchool'){
        const avg=Object.values(s.education.knowledge).reduce((a,b)=>a+b,0)/5;
        s.education.mockScores.push(Math.round(avg));
        if(s.education.grade<12){s.education.grade++;journal(s,'Eğitim',`${s.education.grade}. sınıfa geçtin. Yıl sonu değerlendirmen: ${Math.round(avg)}/100.`);
          decision(s,'direction','school','Yeni yılda hangi alana ağırlık vereceksin?','Alan seçimi ders odağını değiştirir. Üniversite tek seçenek değil; yönünü tekrar değiştirebilirsin.',[
            option('science','Sayısal','Matematik ve fen odağı.',[{kind:'direction',target:'science'}]),option('social','Sözel ve eşit ağırlık','Türkçe ve sosyal bilimler odağı.',[{kind:'direction',target:'social'}]),option('language','Yabancı dil','Dil ve iletişim odağı.',[{kind:'direction',target:'language'}]),
          ]);
        }else{s.education.stage='yks';s.life.qualification='highSchool';s.life.route='preparing';journal(s,'Eğitim','Liseyi tamamladın. Bir dönemin sonu, birçok yolun başlangıcı.');if(s.life.yks.registeredYear!==new Date(s.now).getUTCFullYear())routeDecision(s);}
      }
      schedule(s,'school-year',futureDate(s,5,15),'Okul yılının sonu',s.life.route==='school');return true;
    }
    case 'yks-registration': {
      if((s.education.grade>=12&&s.life.route==='school')||s.life.route==='preparing')decision(s,'yks-registration','school','YKS başvuru zamanı','Bu oyunda başvuru ücretsizdir. Sınava girmek veya başka bir yol denemek senin kararın.',[
        option('register','YKS başvurumu tamamla','Haziran sınavı takvimine eklensin.',[{kind:'registerYks'}],30),
        option('alternative','Başka bir yol seç','Meslek öğrenebilir veya çalışabilirsin.',[{kind:'skipYks'}]),
      ]);
      schedule(s,'yks-registration',futureDate(s,2,1),'YKS başvuru dönemi',s.life.route==='preparing'||s.education.grade>=12&&s.education.stage==='highSchool');return true;
    }
    case 'yks-attendance': decision(s,'yks-attendance','school','Sınav sabahı','Hazırlığın, alan bilgin ve stresin sonuca birlikte yansıyacak. Puanlar 100 üzerinden kurgusal hazırlık puanıdır.',[
      option('attend','Sınava katıl · TYT / AYT / YDT','Üç oturumun oyun içi özeti; 4 saat. Sonuçlar bir hafta sonra.',[{kind:'takeYks'}],240),
      option('skip','Bu yıl katılma','Çalışma, meslek veya tekrar hazırlık yolu açık kalır.',[{kind:'skipYks'}]),
    ]);return true;
    case 'yks-results': {
      journal(s,'Eğitim',`YKS: TYT ${s.life.yks.tyt}, AYT ${s.life.yks.ayt}, YDT ${s.life.yks.ydt} /100.`);
      const programs=availablePrograms(s);
      if(!programs.length){letter(s,'school','Okulum','Bu yıl yerleşme eşiğinin altındasın','Sınav sonucu bir son değil. Çalışma, meslek veya yeniden hazırlık seçeneklerin var.');routeDecision(s);}
      else decision(s,'preferences','school','Tercihlerini sırala',`TYT ${s.life.yks.tyt} · AYT ${s.life.yks.ayt} · YDT ${s.life.yks.ydt}. Birinci tercihini seç; uygun kalan programlar yedek listene eklenir.`,[
        ...programs.map(p=>option(p.id,p.name,`${p.semesters} dönem; eşik ${p.threshold}/100. Kurgusal yerleştirme.`,[{kind:'preferences',target:[p.id,...programs.filter(x=>x.id!==p.id).map(x=>x.id)].join(',')}],30)),
        option('alternative','Tercih vermeden devam et','Meslek veya çalışma yolunu değerlendir.',[{kind:'skipYks'}]),
      ]);return true;
    }
    case 'placement': {
      const p=s.life.yks.preferences.map(id=>rules.programs.find(p=>p.id===id)).find(p=>p&&programScore(s,p.id)>=p.threshold);
      if(!p){routeDecision(s);return true;}
      decision(s,'placement','school','Bir yerin var',`${p.name} seni bekliyor. Kaydolmak zorunda değilsin.`,[
        option('enroll','Yerleştiğim programa kaydol',p.name,[{kind:'enroll',target:p.id}],60),option('decline','Kaydolma, başka yol seç','Tercihini yeniden düşün.',[{kind:'skipYks'}]),
      ]);return true;
    }
    case 'course-registration': courseDecision(s);return true;
    case 'semester-end': {
      if(s.life.route!=='university')return true;
      const l=s.life,avg=Object.values(s.education.knowledge).reduce((a,b)=>a+b,0)/5;
      for(const c of l.courses){c.score=clamp(Math.round(avg*.45+l.termEffort*.35+s.education.attendance*.2+(hashSeed(c.id+s.characterSeed)%9-4)));c.passed=c.score>=50;if(c.passed)s.education.credits+=c.credits;}
      const score=l.courses.reduce((sum,c)=>sum+c.score,0)/Math.max(1,l.courses.length);s.education.gpa=Math.round(score/25*100)/100;l.semester++;
      journal(s,'Eğitim',`${l.semester}. dönem: ${l.courses.filter(c=>c.passed).length}/${l.courses.length} ders geçti; toplam ${s.education.credits} kredi.`);
      letter(s,'school','Öğrenci işleri','Dönem sonuçları',`Ortalama ${s.education.gpa}/4. Başarısız dersler mezuniyeti geciktirir; sonraki dönemde tekrar çalışabilirsin.`);
      const program=rules.programs.find(p=>p.id===s.education.program)??rules.programs[3];
      if(s.education.credits>=program.semesters*30){l.qualification='degree';l.route='working';l.support='none';s.education.stage='graduated';journal(s,'Eğitim',`${program.name} mezunusun. Öğrendiklerin sonraki yollarına eşlik edecek.`);letter(s,'career','Mezunlar ofisi','Mezun oldun','Diploma isteyen işler artık başvurularına açık. Kariyer’den yeni fırsatları incele.');}
      else {schedule(s,'course-registration',iso(Date.parse(s.now)+30*DAY),'Yeni dönem ders kaydı',true);if(l.semester===2)decision(s,'internship','career','Kampüs stajı','Dönem arasında bir uygulama projesi deneyim kazandırabilir.',[
        {...option('join','Staj projesine katıl','Bir ay sonra 60 günlük uygulama deneyimi; sosyal zamandan fedakârlık.',[{kind:'routine',target:'work'}],60),delayed:[{days:30,title:'Staj projesi tamamlandı',effects:[{kind:'internship'},{kind:'routine',target:'balanced'}]}]},
        option('rest','Dönem arasını dinlenerek geçir','Enerji ve sağlık kazan.',[{kind:'wellbeing'}]),
      ]);}
      return true;
    }
    case 'vocational-end': {
      if(s.life.route!=='vocational')return true;
      if(s.life.termEffort>=35){s.life.qualification='vocational';s.life.route='working';s.life.experienceDays+=120;journal(s,'Eğitim','Uygulamalı eğitimi tamamladın. Teknik işlere başvurabilirsin.');letter(s,'career','Meslek atölyesi','Yeterlilik tamamlandı','120 iş günü deneyim kazandın. Kariyer’de teknik roller açıldı.');}
      else {letter(s,'school','Meslek atölyesi','Biraz daha uygulama gerekiyor','İşe odaklanmak eğitim süreni uzattı. Dengeli veya eğitim odaklı bir ritimle yeniden deneyebilirsin.');routeDecision(s);}return true;
    }
    case 'decision-expiry': {
      const d=s.life.decisions.find(d=>d.id===e.entityIds?.[0]);if(d?.status==='pending'&&!d.blocking){d.status='expired';d.outcome='Davet süresi geçti; yanıt verilmedi.';d.resolvedAt=s.now;for(const id of d.relatedEntities){const n=s.npcs.find(n=>n.id===id);if(n)n.relationship.warmth=clamp(n.relationship.warmth-2);}}return true;
    }
    case 'life-followup': for(const effect of s.life.followups[e.id]??[])applyEffect(s,effect);delete s.life.followups[e.id];letter(s,'archive','Hayatın akışı',e.title,'Önceki kararının sonucu hayatına yansıdı.');return true;
    case 'life-end': {
      s.life.status='ended';s.life.endedAt=s.now;stopEmployment(s);
      journal(s,'Hayat',`${s.player.name}’in hayatı ${age(s)} yaşında doğal ve sakin biçimde sona erdi. ${s.life.legacy||'Geride paylaşılan günler, öğrenilenler ve hatıralar kaldı.'}`);
      for(const d of s.life.decisions.filter(d=>d.status==='pending')){d.status='expired';d.outcome='Hayatın hikâyesi tamamlandı.';d.resolvedAt=s.now;}
      for(const event of s.events.filter(e=>!e.processed))markProcessed(s,event);
      letter(s,'archive','Hayat Arşivi','Hikâyen burada saklı','Bu hayatın sayfaları tamamlandı. Hatıralarına bakabilir, kaydını dışa aktarabilir ve yeni bir hayata başlayabilirsin.');return true;
    }
    case 'decision': return true;
    default:return false;
  }
}

export function ensureInterviewDecision(s:State,e:GameEvent) {
  if(e.type!=='interview'||s.life.decisions.some(d=>d.id===e.id))return;
  const options=[option('honest','Dürüst ve sakin konuş','İletişim becerinle ilerle.',[{kind:'interview',target:'honest'}],30),option('prepared','Hazırlığını örneklerle anlat','Disiplinini ve hazırlığını göster.',[{kind:'interview',target:'prepared'}],30),option('confident','Kendinden emin davran','Özgüveninle ilerle.',[{kind:'interview',target:'confident'}],30),option('miss','Görüşmeye katılma','Başvuru kapanır; başka bir işe başvurabilirsin.',[{kind:'interview',target:'miss'}])];
  s.life.decisions.push({id:e.id,type:'interview',source:'career',title:e.title,description:e.details??'İş görüşmesinde yaklaşımını seç.',relatedEntities:e.entityIds??[],createdAt:s.now,severity:'important',blocking:true,options,status:'pending'});
}
export function completeLegacyDecision(s:State,type:string,entity:string,outcome:string) {
  const d=s.life.decisions.find(d=>d.type===type&&d.relatedEntities.includes(entity)&&d.status==='pending');
  if(d){d.status='resolved';d.outcome=outcome;d.resolvedAt=s.now;const e=s.events.find(e=>e.id===d.id);if(e)markProcessed(s,e);}
}
