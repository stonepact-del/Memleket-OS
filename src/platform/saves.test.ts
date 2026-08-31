import { describe, expect, it } from 'vitest';
import { MemorySaveRepository, validateAndMigrate } from './saves';
import { createLife } from '../core/simulation';

describe('save validation and persistence', () => {
  it('round trips a complete valid save', async () => {
    const repository=new MemorySaveRepository();
    const state=createLife({seed:10});
    await repository.save(state);
    expect(await repository.load(state.id)).toEqual(state);
    expect(await repository.list()).toHaveLength(1);
    expect(await repository.import(await repository.export(state.id))).toEqual(state);
  });

  it('preserves the explicit version 1 migration', () => {
    const state=structuredClone(createLife({seed:11})) as unknown as Record<string,unknown>;
    state.schemaVersion=1;
    delete state.settings;
    const migrated=validateAndMigrate(state);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.settings).toEqual({sound:true,reducedMotion:false,largeText:false});
  });

  it('rejects malformed nested objects', () => {
    const state=structuredClone(createLife({seed:12})) as unknown as Record<string,unknown>;
    state.player={name:'bozuk'};
    expect(() => validateAndMigrate(state)).toThrow(/player/);
  });

  it('rejects missing required nested fields', () => {
    const state=structuredClone(createLife({seed:13})) as unknown as Record<string,unknown>;
    const household=state.household as Record<string,unknown>;
    delete household.housing;
    expect(() => validateAndMigrate(state)).toThrow(/household\.housing/);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_SAFE_INTEGER+1])('rejects unsafe balance %s', invalid => {
    const state=structuredClone(createLife({seed:14}));
    state.balance=invalid;
    expect(() => validateAndMigrate(state)).toThrow(/balance/);
  });

  it('rejects unsafe nested monetary values', () => {
    const state=structuredClone(createLife({seed:15}));
    state.ledger[0].amount=Number.MAX_SAFE_INTEGER+1;
    expect(() => validateAndMigrate(state)).toThrow(/ledger\.0\.amount/);
  });

  it('does not replace an existing save after an invalid import', async () => {
    const repository=new MemorySaveRepository();
    const state=createLife({seed:16});
    await repository.save(state);
    await expect(repository.import(JSON.stringify({...state,player:{name:'bozuk'}}))).rejects.toThrow(/player/);
    expect(await repository.load(state.id)).toEqual(state);
  });
});
