import { ActionButton, AppDecisions } from '../../life/LifeControls';
import { money } from '../../format';
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { BankOverview } from "./BankOverview";
import { TransactionList } from "./TransactionList";
import "./bank.css";
export function BankApp({ game }: { game: State }) {
  return (
    <AppShell title="CepBanka" variant="hidden">
      <main className="bank-native-layout" data-app-identity="bank-native">
        <BankOverview game={game} />
        <section className="life-section"><h2>Bugün ve ilerisi</h2><dl className="life-facts"><div><dt>Birikim</dt><dd>{money(game.life.savings)}</dd></div><div><dt>Borç</dt><dd>{money(game.life.debt)}</dd></div><div><dt>Yaşam yeri</dt><dd>{game.household.housing.kind}</dd></div></dl><div className="life-actions"><ActionButton game={game} id="save-money"/><ActionButton game={game} id="withdraw"/><ActionButton game={game} id="repay"/></div><p className="scenario-note">Kurgusal senaryo: borçlar faizsizdir. Birikim getirisi yoktur. Kira, ev ve ulaşım giderleri her ay takvimde işlenir.</p>{game.life.ledgerArchive.count>0&&<p className="scenario-note">Önceki {game.life.ledgerArchive.count} hareketin net toplamı: {money(game.life.ledgerArchive.net)}. Son 600 işlem tam kayıtla saklanır.</p>}</section>
        <AppDecisions game={game} source="bank"/>
        <TransactionList items={game.ledger} />
        <p className="bank-disclaimer">Kurgusal, yerel hesap görünümü.</p>
      </main>
    </AppShell>
  );
}
