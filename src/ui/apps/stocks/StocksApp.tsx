import { ArrowLeft, Building2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { Company, State } from "../../../core/model";
import { useGame } from "../../../store";
import { money } from "../../format";
import { AppShell } from "../../os/AppShell";

function Mark({ company }: { company: Company }) {
  return <span className="stock-mark" aria-hidden="true">{company.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</span>;
}
function Chart({ company }: { company: Company }) {
  const values=company.priceHistory.length>1?company.priceHistory:[company.price,company.price];
  const min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min);
  const points=values.map((value,index)=>`${10+(index/Math.max(1,values.length-1))*300},${94-((value-min)/range)*72}`).join(" ");
  return <svg className="stock-chart" viewBox="0 0 320 108" role="img" aria-label={`${company.name} deterministik fiyat geçmişi, en düşük ${money(min)}, en yüksek ${money(max)}`}><defs><linearGradient id="marketGlow" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#57d6a2" stopOpacity=".35"/><stop offset="1" stopColor="#57d6a2" stopOpacity="0"/></linearGradient></defs><path d={`M ${points.replaceAll(" "," L ")} L 310 104 L 10 104 Z`} fill="url(#marketGlow)"/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function StocksApp({game}:{game:State}){
  const [selected,setSelected]=useState<string>(); const trade=useGame(x=>x.trade); const company=game.companies.find(x=>x.id===selected);
  const invested=game.companies.reduce((sum,c)=>sum+(game.holdings[c.id]?.quantity??0)*c.price,0);
  if(company){const holding=game.holdings[company.id]??{quantity:0,cost:0},value=holding.quantity*company.price,gain=value-holding.cost,direction=company.priceHistory.at(-1)!-(company.priceHistory.at(-2)??company.price);
    return <AppShell title="Piyasa" variant="hidden"><main className="stocks-app stock-detail" data-app-identity="stocks-native"><header><button aria-label="Piyasaya dön" onClick={()=>setSelected(undefined)}><ArrowLeft/></button><Mark company={company}/><div><small>{company.sector}</small><h1>{company.name}</h1></div></header><section className="quote"><span>Güncel fiyat</span><strong>{money(company.price)}</strong><em className={direction>=0?"up":"down"}>{direction>=0?<TrendingUp/>:<TrendingDown/>}{money(Math.abs(direction))}</em><Chart company={company}/></section><dl className="company-vitals"><div><dt>Şirket sağlığı</dt><dd>%{company.health}</dd></div><div><dt>İşe alım talebi</dt><dd>%{company.hiringDemand}</dd></div><div><dt>Sahip olunan</dt><dd>{holding.quantity} adet</dd></div><div><dt>Toplam değer</dt><dd>{money(value)}</dd></div><div><dt>Maliyet</dt><dd>{money(holding.cost)}</dd></div><div><dt>Fark</dt><dd className={gain>=0?"up":"down"}>{money(gain)}</dd></div></dl><div className="trade-bar"><button onClick={()=>trade(company.id,1)}>1 adet al</button><button disabled={!holding.quantity} onClick={()=>trade(company.id,-1)}>1 adet sat</button></div><small className="market-note">Kurgusal simülasyon piyasası · Finansal tavsiye değildir.</small></main></AppShell>}
  return <AppShell title="Piyasa" variant="hidden"><main className="stocks-app" data-app-identity="stocks-native"><header className="market-header"><button aria-label="Ana ekrana dön" onClick={()=>useGame.getState().open("home")}>‹</button><div><small>KİŞİSEL PİYASA</small><h1>Piyasa</h1></div><Building2/></header><section className="portfolio"><small>VARLIK DEĞERİ</small><strong>{money(invested)}</strong><span>{Object.values(game.holdings).reduce((n,h)=>n+h.quantity,0)} adet yatırım</span></section><div className="market-rule"><span>Şirketler</span><small>Güncel fiyat · portföy</small></div><section className="market-list">{game.companies.slice(0,16).map(c=>{const h=game.holdings[c.id],previous=c.priceHistory.at(-2)??c.price,up=c.price>=previous;return <button key={c.id} onClick={()=>setSelected(c.id)} aria-label={`${c.name} şirketini aç`}><Mark company={c}/><span><b>{c.name}</b><small>{c.sector}</small></span><span className="market-numbers"><b>{money(c.price)}</b><small className={up?"up":"down"}>{up?"▲":"▼"} {money(Math.abs(c.price-previous))}</small>{h?.quantity?<em>{h.quantity} adet</em>:null}</span></button>})}</section></main></AppShell>
}
