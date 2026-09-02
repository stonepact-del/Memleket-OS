import { useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { NewsFeed } from "./NewsFeed";
import { NewsArticle } from "./NewsArticle";
import "./news.css";
export function NewsApp({ game }: { game: State }) { const [activeId, setActiveId] = useState<string>(); const sorted = [...game.news].sort((a, b) => b.at.localeCompare(a.at)); const active = sorted.find((item) => item.id === activeId); return <AppShell title="Gündem" variant="hidden"><main className="news-app" data-app-identity="news-native">{active ? <NewsArticle article={active} onBack={() => setActiveId(undefined)} /> : <NewsFeed articles={sorted} now={game.now} onOpen={setActiveId} onHome={() => useGame.getState().open("home")} />}</main></AppShell>; }
