import { z } from 'zod';

export type Money = number;
export type AppId = 'home' | 'archive' | 'school' | 'career' | 'bank' | 'market' | 'chat' | 'feed' | 'mail' | 'news' | 'stocks' | 'calendar' | 'map' | 'notes' | 'settings';
export interface Traits { discipline:number; confidence:number; socialSkill:number; academicAbility:number; financialLiteracy:number; resilience:number; creativity:number; adaptability:number; fitness:number }
export interface Memory { id:string; kind:string; at:string; impact:number; summary:string }
export interface NPC { id:string; name:string; age:number; role:string; personality:string; education:string; occupation:string; income:Money; goal:string; lifeStage:string; closeness:'close'|'relevant'|'distant'; relationship:{familiarity:number; warmth:number; trust:number; tension:number}; memories:Memory[] }
export interface Ledger { id:string; at:string; amount:Money; kind:'income'|'expense'|'transfer'|'investment'; description:string; balanceAfter:Money }
export interface GameEvent { id:string; at:string; type:string; title:string; important:boolean; processed?:boolean; entityIds?:string[] }
export interface Notification { id:string; at:string; app:AppId; title:string; body:string; read:boolean }
export interface Listing { id:string; category:'Vasıta'|'Emlak'|'Elektronik'|'Ev & Yaşam'; title:string; price:Money; marketValue:Money; condition:number; seller:string; favorite:boolean; status:'active'|'sold'|'expired'; details:string; hiddenIssue?:string; negotiation?:{contacted:boolean;offer?:Money;agreedPrice?:Money;counterOffer?:Money;inspected:boolean;revealedIssue?:string} }
export interface Company { id:string; name:string; sector:string; size:string; health:number; growth:number; reputation:number; hiringDemand:number; layoffRisk:number; price:Money; priceHistory:number[] }
export interface Job { id:string; companyId:string; position:string; city:string; salary:Money; education:string; experience:number; skills:string[]; workType:string }
export interface Application { id:string; jobId:string; state:'submitted'|'viewed'|'rejection'|'no response'|'interview'|'later stage'|'offer'|'accepted'|'declined'|'withdrawn'; updatedAt:string; interviewAt?:string }
export interface FeedComment { id:string; authorId:string; at:string; text:string }
export interface NewsItem { id:string; at:string; category:string; title:string; body:string; companyId?:string }
export interface Message { id:string; npcId:string; at:string; text:string; fromPlayer:boolean }
export interface State { schemaVersion:3; simulationVersion:string; worldSeed:number; characterSeed:number; rngState:number; id:string; createdAt:string; updatedAt:string; now:string; speed:0|1|4|12; player:{name:string; birthDate:string; province:string; district:string; traits:Traits; energy:number; stress:number; mood:number; health:number; social:number}; household:{memberIds:string[]; income:Money; expenses:Money; savings:Money; socioeconomic:string; housing:{kind:string; province:string; district:string; rent:Money; size:number; quality:number; commute:number; costs:Money}}; npcs:NPC[]; balance:Money; ledger:Ledger[]; events:GameEvent[]; notifications:Notification[]; archive:{at:string; category:string; text:string}[]; education:{stage:'highSchool'|'yks'|'university'|'graduated'; school:string; grade:number; knowledge:Record<string,number>; attendance:number; consistency:number; mockScores:number[]; gpa:number; credits:number; program?:string}; companies:Company[]; jobs:Job[]; applications:Application[]; employment?:{jobId:string; performance:number; startedAt:string}; listings:Listing[]; vehicles:{listingId:string; title:string; value:Money; condition:number}[]; messages:Message[]; posts:{id:string; npcId:string; at:string; text:string; likes:number; liked:boolean; comments:FeedComment[]}[]; mails:{id:string; at:string; sender:string; subject:string; body:string; read:boolean; app?:AppId}[]; news:NewsItem[]; location:string; holdings:Record<string,{quantity:number; cost:Money}>; notes:string; settings:{sound:boolean; reducedMotion:boolean; largeText:boolean; wallpaper:'city'|'coast'|'simple'}; processedEventIds:string[] }

const text = z.string();
const id = z.string().min(1);
const timestamp = z.iso.datetime();
const finite = z.number().finite();
const integer = z.number().int().safe();
const money = integer;
const metric = finite.min(0).max(100);
const traitsSchema = z.strictObject({ discipline:metric, confidence:metric, socialSkill:metric, academicAbility:metric, financialLiteracy:metric, resilience:metric, creativity:metric, adaptability:metric, fitness:metric });
const memorySchema = z.strictObject({ id, kind:text, at:timestamp, impact:finite, summary:text });
const relationshipSchema = z.strictObject({ familiarity:metric, warmth:metric, trust:metric, tension:metric });
const npcSchema = z.strictObject({ id, name:text, age:finite.nonnegative(), role:text, personality:text, education:text, occupation:text, income:money, goal:text, lifeStage:text, closeness:z.enum(['close','relevant','distant']), relationship:relationshipSchema, memories:z.array(memorySchema) });
const ledgerSchema = z.strictObject({ id, at:timestamp, amount:money, kind:z.enum(['income','expense','transfer','investment']), description:text, balanceAfter:money });
const eventSchema = z.strictObject({ id, at:timestamp, type:text, title:text, important:z.boolean(), processed:z.boolean().optional(), entityIds:z.array(id).optional() });
const notificationSchema = z.strictObject({ id, at:timestamp, app:z.enum(['home','archive','school','career','bank','market','chat','feed','mail','news','stocks','calendar','map','notes','settings']), title:text, body:text, read:z.boolean() });
const listingSchema = z.strictObject({ id, category:z.enum(['Vasıta','Emlak','Elektronik','Ev & Yaşam']), title:text, price:money, marketValue:money, condition:metric, seller:text, favorite:z.boolean(), status:z.enum(['active','sold','expired']), details:text, hiddenIssue:text.optional(), negotiation:z.strictObject({contacted:z.boolean(),offer:money.optional(),agreedPrice:money.optional(),counterOffer:money.optional(),inspected:z.boolean(),revealedIssue:text.optional()}).optional() });
const companySchema = z.strictObject({ id, name:text, sector:text, size:text, health:metric, growth:finite, reputation:metric, hiringDemand:metric, layoffRisk:metric, price:money, priceHistory:z.array(money) });
const jobSchema = z.strictObject({ id, companyId:id, position:text, city:text, salary:money, education:text, experience:finite.nonnegative(), skills:z.array(text), workType:text });
const applicationSchema = z.strictObject({ id, jobId:id, state:z.enum(['submitted','viewed','rejection','no response','interview','later stage','offer','accepted','declined','withdrawn']), updatedAt:timestamp, interviewAt:timestamp.optional() });
const messageSchema = z.strictObject({ id, npcId:id, at:timestamp, text, fromPlayer:z.boolean() });

export const saveSchema: z.ZodType<State> = z.strictObject({
  schemaVersion:z.literal(3), simulationVersion:z.string().min(1), worldSeed:integer.nonnegative(), characterSeed:integer.nonnegative(), rngState:integer.nonnegative(), id, createdAt:timestamp, updatedAt:timestamp, now:timestamp, speed:z.union([z.literal(0),z.literal(1),z.literal(4),z.literal(12)]),
  player:z.strictObject({ name:text, birthDate:timestamp, province:text, district:text, traits:traitsSchema, energy:metric, stress:metric, mood:metric, health:metric, social:metric }),
  household:z.strictObject({ memberIds:z.array(id), income:money, expenses:money, savings:money, socioeconomic:text, housing:z.strictObject({ kind:text, province:text, district:text, rent:money, size:finite.nonnegative(), quality:metric, commute:finite.nonnegative(), costs:money }) }),
  npcs:z.array(npcSchema), balance:money, ledger:z.array(ledgerSchema), events:z.array(eventSchema), notifications:z.array(notificationSchema),
  archive:z.array(z.strictObject({ at:timestamp, category:text, text })),
  education:z.strictObject({ stage:z.enum(['highSchool','yks','university','graduated']), school:text, grade:finite.nonnegative(), knowledge:z.record(z.string(),metric), attendance:metric, consistency:metric, mockScores:z.array(finite), gpa:finite, credits:finite.nonnegative(), program:text.optional() }),
  companies:z.array(companySchema), jobs:z.array(jobSchema), applications:z.array(applicationSchema), employment:z.strictObject({ jobId:id, performance:metric, startedAt:timestamp }).optional(), listings:z.array(listingSchema),
  vehicles:z.array(z.strictObject({ listingId:id, title:text, value:money, condition:metric })), messages:z.array(messageSchema), posts:z.array(z.strictObject({ id, npcId:id, at:timestamp, text, likes:integer.nonnegative(), liked:z.boolean(), comments:z.array(z.strictObject({id,authorId:id,at:timestamp,text})) })), mails:z.array(z.strictObject({ id, at:timestamp, sender:text, subject:text, body:text, read:z.boolean(), app:z.enum(['home','archive','school','career','bank','market','chat','feed','mail','news','stocks','calendar','map','notes','settings']).optional() })), news:z.array(z.strictObject({id,at:timestamp,category:text,title:text,body:text,companyId:id.optional()})), location:text,
  holdings:z.record(z.string(),z.strictObject({ quantity:integer.nonnegative(), cost:money })), notes:text, settings:z.strictObject({ sound:z.boolean(), reducedMotion:z.boolean(), largeText:z.boolean(), wallpaper:z.enum(['city','coast','simple']) }), processedEventIds:z.array(id)
});

export function assertMoney(n:number) { if (!Number.isSafeInteger(n)) throw new Error('Güvenli para sınırı aşıldı'); }
