import { describe, expect, it } from 'vitest';
import { executeAction } from './actions';
import { createLife, decideOffer, advance, advanceMinutes, postLedger } from './simulation';

describe('clock and payroll regressions', () => {
  it('replacing employment cancels the former payroll schedule', () => {
    const s = createLife({ seed: 42 });
    for (const index of [0, 1]) {
      const a = { id: `offer-${index}`, jobId: s.jobs[index].id, state: 'offer' as const, updatedAt: s.now, statusUnread: true };
      s.applications.push(a); decideOffer(s, a.id, true);
    }
    advance(s, 30);
    const salaries = s.ledger.filter(t => t.description.includes('maaşı'));
    expect(salaries).toHaveLength(1);
    expect(salaries[0].amount).toBe(s.jobs[1].salary);
  });
  it('rejects fractional kuruş even when the resulting balance would be integral', () => {
    const s = createLife({seed: 1}); s.balance = 0.5;
    expect(() => postLedger(s, 0.5, 'Invalid', 'income')).toThrow();
  });
  it('rejects non-finite time without mutating the calendar', () => {
    const s = createLife({seed: 1}); const before = structuredClone(s);
    expect(() => advanceMinutes(s, NaN)).toThrow(); expect(s).toEqual(before);
  });
  it('rolls back a timed action when a due expense removes affordability', () => {
    const s = createLife({seed: 2});
    s.balance = 250000;
    s.ledger[0].amount = s.balance;
    s.ledger[0].balanceAfter = s.balance;
    s.life.route = 'working';
    s.education.stage = 'graduated';
    s.vehicles.push({listingId:'owned',title:'Yalın 1.4',value:30000000,condition:40});
    const monthly = s.events.find(e => e.type === 'life-month')!;
    monthly.at = new Date(Date.parse(s.now) + 30 * 60000).toISOString();
    const before = structuredClone(s);
    expect(() => executeAction(s,{id:'vehicle-maintenance'})).toThrow(/bakiye artık yeterli/i);
    expect(s).toEqual(before);
  });
});
