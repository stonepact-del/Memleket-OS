import { describe, expect, it } from 'vitest';
import { AutosaveQueue } from './autosave';
import { createLife } from '../core/simulation';

describe('autosave ordering and failure recovery',()=>{
  it('writes snapshots in order and does not let later caller mutations change saved data',async()=>{
    let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve});const written:string[]=[];
    const queue=new AutosaveQueue({save:async s=>{if(!written.length)await gate;written.push(s.notes)}});
    const s=createLife({seed:90});s.notes='first';const first=queue.save(s);s.notes='second';const second=queue.save(s);s.notes='unsaved';
    expect(written).toEqual([]);release();await Promise.all([first,second]);expect(written).toEqual(['first','second']);
  });
  it('surfaces a failed write and still saves the next snapshot',async()=>{
    let attempt=0;const queue=new AutosaveQueue({save:async()=>{if(attempt++===0)throw Error('Storage full')}});
    await expect(queue.save(createLife({seed:91}))).rejects.toThrow('Storage full');
    await expect(queue.save(createLife({seed:91}))).resolves.toBeUndefined();await queue.flush();expect(attempt).toBe(2);
  });
});
