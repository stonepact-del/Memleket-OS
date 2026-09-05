import type { State } from '../core/model';
import type { SaveRepository } from './saves';
/** Serialize writes so a slow earlier snapshot cannot replace a newer life. */
export class AutosaveQueue {
  private tail:Promise<void>=Promise.resolve();
  constructor(private repository:Pick<SaveRepository,'save'>){}
  save(state:State):Promise<void>{
    const snapshot=structuredClone(state);
    const task=this.tail.catch(()=>undefined).then(()=>this.repository.save(snapshot));
    this.tail=task;
    return task;
  }
  async flush(){await this.tail;}
}
