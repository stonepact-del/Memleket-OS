import{describe,it,expect}from'vitest';import{simulationTimeOfDay}from'./wallpaper';
describe('simulation wallpaper time',()=>{it.each([[7,'morning'],[12,'day'],[19,'evening'],[23,'night']]as const)('maps simulation hour %s to %s',(hour,expected)=>expect(simulationTimeOfDay(new Date(Date.UTC(2026,0,1,hour)).toISOString())).toBe(expected))});
