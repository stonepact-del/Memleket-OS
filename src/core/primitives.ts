import type { AppId, GameEvent, Ledger, State } from './model';
import { assertMoney } from './model';
export const DAY = 86400000, MINUTE = 60000;
export const iso = (n:number) => new Date(n).toISOString();
export const clamp = (n:number) => Math.max(0, Math.min(100, n));
export function nextId(s:State, prefix:string) { return `${prefix}:${s.life.sequence++}`; }
export function schedule(s:State, type:string, at:string, title:string, important=false, entityIds?:string[]) {
  const e:GameEvent = {id:nextId(s, type), type, at, title, important, ...(entityIds ? {entityIds} : {})};
  s.events.push(e); return e;
}
export function postLedger(s:State, amount:number, description:string, kind:Ledger['kind']) {
  assertMoney(amount); assertMoney(s.balance); assertMoney(s.balance + amount);
  s.balance += amount;
  s.ledger.unshift({id:nextId(s,'tx'),at:s.now,amount,description,kind,balanceAfter:s.balance});
  if (s.ledger.length > 600) {
    const old=s.ledger.splice(600); s.life.ledgerArchive.count+=old.length;
    s.life.ledgerArchive.net+=old.reduce((sum,t)=>sum+t.amount,0);
    assertMoney(s.life.ledgerArchive.net); s.life.ledgerArchive.through=old[0].at;
  }
}
export function notify(s:State, app:AppId, title:string, body:string) {
  s.notifications.unshift({id:nextId(s,'notice'),at:s.now,app,title,body,read:false});
  s.notifications=s.notifications.slice(0,80);
}
export function journal(s:State, category:string, text:string) { s.archive.push({at:s.now,category,text}); }
export function letter(s:State, app:AppId, sender:string, subject:string, body:string) {
  s.mails.unshift({id:nextId(s,'mail'),at:s.now,sender,subject,body,read:false,app}); s.mails=s.mails.slice(0,100);
  notify(s,app,subject,body);
}
export function age(s:State) {
  const b=new Date(s.player.birthDate), n=new Date(s.now);
  return n.getUTCFullYear()-b.getUTCFullYear()-Number(n.getUTCMonth()<b.getUTCMonth() || (n.getUTCMonth()===b.getUTCMonth()&&n.getUTCDate()<b.getUTCDate()));
}
export function markProcessed(s:State,e:GameEvent) {
  if(e.processed) return false;
  e.processed=true; e.requiresInput=false; s.processedEventIds.push(e.id); return true;
}
export function trimHistories(s:State) {
  const keep=s.events.filter(e=>e.processed).slice(-160);
  const ids=new Set(keep.map(e=>e.id));
  s.events=s.events.filter(e=>!e.processed||ids.has(e.id));
  s.processedEventIds=s.events.filter(e=>e.processed).map(e=>e.id);
  s.messages=s.messages.slice(-240); s.posts=s.posts.slice(0,80); s.news=s.news.slice(0,60);
  s.mails=s.mails.slice(0,100); s.notifications=s.notifications.slice(0,80); s.education.mockScores=s.education.mockScores.slice(-24);
  // Preserve all major life milestones; routine study entries have a separate retention budget.
  const routine=s.archive.filter(e=>e.category==='Çalışma').slice(-60);
  s.archive=[...s.archive.filter(e=>e.category!=='Çalışma').slice(-1200),...routine].sort((a,b)=>a.at.localeCompare(b.at));
  s.life.decisions=[...s.life.decisions.filter(d=>d.status!=='pending').slice(-80),...s.life.decisions.filter(d=>d.status==='pending')];
}
