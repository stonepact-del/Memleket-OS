import { z } from 'zod';
import { TurkeyRuleset } from '../data/turkeyRuleset';

const count = z.number().int().safe().nonnegative();
const metric = z.number().finite().min(0).max(100);
const at = z.iso.datetime();
export const routineSchema = z.enum(['balanced', 'study', 'work', 'social', 'health', 'creative']);
export type Routine = z.infer<typeof routineSchema>;
export const effectSchema = z.strictObject({
  kind: z.enum(['interview', 'offer', 'routine', 'direction', 'registerYks', 'takeYks', 'skipYks', 'preferences', 'enroll', 'vocational', 'working', 'courses', 'leave', 'transfer', 'housing', 'support', 'debt', 'relationship', 'promotion', 'quit', 'retire', 'continue', 'legacy', 'wellbeing', 'internship', 'followup']),
  target: z.string().max(1000).optional(), value: z.number().finite().optional(),
}).superRefine((e,ctx)=>{
  const allowed:Partial<Record<typeof e.kind,string[]>>={routine:['balanced','study','work','social','health','creative'],direction:['science','language','social'],housing:Object.keys(TurkeyRuleset.housing),support:['none','grant','loan'],courses:['standard','light'],enroll:TurkeyRuleset.programs.map(p=>p.id),transfer:TurkeyRuleset.programs.map(p=>p.id),interview:['honest','prepared','confident','miss']};
  if(allowed[e.kind]&&!allowed[e.kind]!.includes(e.target??''))ctx.addIssue({code:'custom',message:'Geçersiz etki hedefi',path:['target']});
  if(e.kind==='debt'&&(!Number.isSafeInteger(e.value)||(e.value??0)<=0||(e.value??0)>TurkeyRuleset.debtLimit))ctx.addIssue({code:'custom',message:'Geçersiz borç tutarı',path:['value']});
  if(e.kind==='preferences'&&!(e.target??'').split(',').every(id=>TurkeyRuleset.programs.some(p=>p.id===id)))ctx.addIssue({code:'custom',message:'Geçersiz tercih',path:['target']});
});
export type LifeEffect = z.infer<typeof effectSchema>;
export const decisionSchema = z.strictObject({
  id: z.string().min(1), type: z.string().min(1), source: z.enum(['school', 'career', 'bank', 'market', 'chat', 'archive']),
  title: z.string(), description: z.string(), relatedEntities: z.array(z.string()), createdAt: at, deadline: at.optional(),
  severity: z.enum(['ordinary', 'important', 'critical']), blocking: z.boolean(),
  options: z.array(z.strictObject({id:z.string(), label:z.string(), description:z.string(), timeMinutes:count, moneyCost:count,
    eligibility:z.enum(['always','student','adult','employed','degree','qualified','affordable']).default('always'),
    effects:z.array(effectSchema), delayed:z.array(z.strictObject({days:count, title:z.string(), effects:z.array(effectSchema)})),
  })).min(1),
  status:z.enum(['pending','resolved','expired']), outcome:z.string().optional(), resolvedAt:at.optional(),
});
export type Decision = z.infer<typeof decisionSchema>;
export type DecisionOption = Decision['options'][number];
export const lifeSchema = z.strictObject({
  rulesetId:z.literal('tr-fiction-2026-v1'), sequence:count, status:z.enum(['living','retired','ended']),
  routine:routineSchema, focus:z.string(), direction:z.enum(['science','language','social']),
  dayCount:count, routineDays:count, lastActionDay:z.string(), actionMinutes:count,
  qualification:z.enum(['none','highSchool','vocational','degree']),
  route:z.enum(['school','preparing','university','vocational','working']),
  yks:z.strictObject({attempts:count, registeredYear:count, tyt:metric, ayt:metric, ydt:metric, resultYear:count, preferences:z.array(z.string())}),
  semester:count, termEffort:metric, courses:z.array(z.strictObject({id:z.string(), name:z.string(), credits:count, score:metric, passed:z.boolean()})),
  studyLoad:z.enum(['standard','light']), internship:z.boolean(), experienceDays:count, workDays:count, careerLevel:count,
  savings:count, debt:count, support:z.enum(['none','grant','loan']), pension:count, retiredAt:at.optional(),
  endAt:at, endedAt:at.optional(), legacy:z.string(),
  cooldowns:z.record(z.string(), at), decisions:z.array(decisionSchema),
  followups:z.record(z.string(), z.array(effectSchema)),
  people:z.record(z.string(), z.strictObject({birthYear:count,busyUntil:at,lastContact:at,alive:z.boolean()})),
  population:z.strictObject({students:count,workers:count,retirees:count}),
  ledgerArchive:z.strictObject({count:count,net:z.number().int().safe(),through:at.optional()}),
});
export type LifeState = z.infer<typeof lifeSchema>;
