export type TimeOfDay='morning'|'day'|'evening'|'night';
/** Uses the persisted simulation timestamp, never wall-clock time. */
export function simulationTimeOfDay(value:string):TimeOfDay{const hour=new Date(value).getUTCHours();return hour<10?'morning':hour<17?'day':hour<21?'evening':'night'}
