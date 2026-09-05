import type { NPC, State } from './model';
import type { LifeState } from './lifeModel';
import { DAY, iso, schedule } from './primitives';
import { TurkeyRuleset as rules } from '../data/turkeyRuleset';
export function initialLife(now:string,npcs:NPC[]):LifeState {
  const year=new Date(now).getUTCFullYear();
  return {rulesetId:rules.id,sequence:1,status:'living',routine:'balanced',focus:'Matematik',direction:'science',dayCount:0,routineDays:0,lastActionDay:now.slice(0,10),actionMinutes:0,
    qualification:'none',route:'school',yks:{attempts:0,registeredYear:0,tyt:0,ayt:0,ydt:0,resultYear:0,preferences:[]},semester:0,termEffort:0,courses:[],studyLoad:'standard',internship:false,
    experienceDays:0,workDays:0,careerLevel:0,savings:0,debt:0,support:'none',pension:0,endAt:iso(Date.UTC(year+70,5,1,7)),legacy:'',cooldowns:{},decisions:[],followups:{},
    people:Object.fromEntries(npcs.map(n=>[n.id,{birthYear:year-n.age,busyUntil:now,lastContact:now,alive:true}])),population:{students:480,workers:2100,retirees:640},ledgerArchive:{count:0,net:0},narrativeHistory:[],narrativeChains:{}};
}
export function futureDate(s:State,month:number,date:number,hour=9) {
  const year=new Date(s.now).getUTCFullYear();
  const at=Date.UTC(year,month,date,hour);
  return iso(at>Date.parse(s.now)?at:Date.UTC(year+1,month,date,hour));
}
export function setupLife(s:State, migrated=false) {
  const now=Date.parse(s.now),year=new Date(s.now).getUTCFullYear();
  const end=Date.UTC(new Date(s.player.birthDate).getUTCFullYear()+82+s.worldSeed%9,5,1,7);
  s.life.endAt=iso(Math.max(now+10*365*DAY,end));
  schedule(s,'life-day',iso(now+DAY),'Günlük düzen');
  schedule(s,'life-month',iso(Date.UTC(year,new Date(s.now).getUTCMonth()+1,2,8)),'Aylık bütçe ve yaşam');
  schedule(s,'life-year',futureDate(s,8,1,7),'Yeni bir dönem',true);
  schedule(s,'school-year',futureDate(s,rules.school.endMonth,rules.school.endDay),'Okul yılının sonu',true);
  schedule(s,'yks-registration',futureDate(s,rules.yks.registrationMonth,rules.yks.registrationDay),'YKS başvuru dönemi',true);
  schedule(s,'life-end',s.life.endAt,'Hikâyenin son sayfası',true);
  if(migrated){
    s.life.route=s.education.stage==='university'?'university':s.education.stage==='highSchool'?'school':s.education.stage==='yks'?'preparing':'working';
    s.life.qualification=s.education.stage==='graduated'?'degree':s.education.stage==='highSchool'?'none':'highSchool';
    if(s.education.stage==='university')schedule(s,'course-registration',iso(now+DAY),'Dönem kaydı',true);
  } else {
    s.archive.unshift({at:s.player.birthDate,category:'Çocukluk',text:`${s.player.province}’da başlayan bir hikâye. Ailenin ilk hatıraları burada.`},
      {at:iso(Date.UTC(2017,8,1)),category:'Çocukluk',text:'İlk okul günün. Yeni bir defter, tanımadığın sesler, eve anlatacak çok şey.'});
  }
  for(const [index,position,education,experience,salary] of [
    [12,'Atölye teknisyeni','Mesleki yeterlilik',120,2400000], [13,'Müşteri danışmanı','Lise mezunu',0,1800000],
    [14,'Yazılım geliştirici','Üniversite mezunu',0,3500000], [15,'Ekip sorumlusu','Deneyim',900,4200000],
    [16,'İçerik tasarımcısı','Üniversite mezunu',0,2800000], [17,'Operasyon uzmanı','Deneyim',360,3000000],
  ] as const) if(!s.jobs.some(j=>j.id===`job-${index}`))s.jobs.push({id:`job-${index}`,companyId:s.companies[index%s.companies.length].id,position,education,experience,salary,city:s.player.province,skills:['iletişim','mesleki gelişim'],workType:'Tam zamanlı'});
}
