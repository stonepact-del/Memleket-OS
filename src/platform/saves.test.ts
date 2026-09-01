import{describe,expect,it}from'vitest';import{MemorySaveRepository,validateAndMigrate}from'./saves';import{createLife}from'../core/simulation';
const asVersion=(version:number)=>{const s=structuredClone(createLife({seed:11}))as unknown as Record<string,unknown>;s.schemaVersion=version;if(version<=3){for(const m of s.messages as Record<string,unknown>[])delete m.read;for(const a of s.applications as Record<string,unknown>[])delete a.statusUnread}if(version<=2){delete s.location;delete s.news;const settings=s.settings as Record<string,unknown>;delete settings.wallpaper;for(const p of s.posts as Record<string,unknown>[])delete p.comments}return s};
describe('save validation and persistence',()=>{
 it('round trips v4',async()=>{const r=new MemorySaveRepository(),s=createLife({seed:10});await r.save(s);expect(await r.load(s.id)).toEqual(s)});
 it.each([1,2,3])('migrates valid v%s to v4',version=>expect(validateAndMigrate(asVersion(version)).schemaVersion).toBe(4));
 it.each([['settings',null],['settings',[]],['posts',null],['posts',{}]])('rejects malformed v2 %s without TypeError',(key,value)=>{const s=asVersion(2);s[key]=value;expect(()=>validateAndMigrate(s)).toThrow(/Kayıt doğrulanamadı/)});
 it('rejects malformed nested v2 post without TypeError',()=>{const s=asVersion(2);s.posts=[null];expect(()=>validateAndMigrate(s)).toThrow(/posts\.0/)});
 it.each([['news',{}],['location',4],['listings',null]])('rejects malformed new field %s',(key,value)=>{const s=structuredClone(createLife({seed:13}))as unknown as Record<string,unknown>;s[key]=value;expect(()=>validateAndMigrate(s)).toThrow(/Kayıt doğrulanamadı/)});
 it('rejects malformed negotiation',()=>{const s=createLife({seed:14});s.listings[0].negotiation={contacted:true,inspected:false,offer:NaN};expect(()=>validateAndMigrate(s)).toThrow(/negotiation/)});
 it('does not replace a valid save after corrupt import',async()=>{const r=new MemorySaveRepository(),s=createLife({seed:16});await r.save(s);await expect(r.import(JSON.stringify({...s,posts:null}))).rejects.toThrow();expect(await r.load(s.id)).toEqual(s)});
 it.each([NaN,Infinity,Number.MAX_SAFE_INTEGER+1])('rejects unsafe balance %s',value=>{const s=createLife({seed:17});s.balance=value;expect(()=>validateAndMigrate(s)).toThrow(/balance/)})
});
