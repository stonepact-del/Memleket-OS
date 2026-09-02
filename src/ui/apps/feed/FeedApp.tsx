import { useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { FeedPost } from "./FeedPost";
import { PostDetail } from "./PostDetail";
import "./feed.css";

export function FeedApp({ game }: { game: State }) {
  const [activeId, setActiveId] = useState<string>();
  const active = game.posts.find((post) => post.id === activeId);
  const like = useGame((state) => state.like);
  const comment = useGame((state) => state.comment);
  return (
    <AppShell title="Akış" variant="hidden">
      <main className="feed-app" data-app-identity="feed-native">
        {active ? (
          <PostDetail
            game={game}
            post={active}
            onBack={() => setActiveId(undefined)}
            onLike={() => like(active.id)}
            onComment={(text) => comment(active.id, text)}
          />
        ) : (
          <>
            <header className="feed-masthead">
              <button aria-label="Ana ekrana dön" onClick={() => useGame.getState().open("home")}>‹</button>
              <div><small>YAKIN ÇEVREN</small><h1>Akış</h1></div>
              <span aria-hidden="true">●</span>
            </header>
            <section className="feed-stream" aria-label="Sosyal akış">
              {game.posts.length ? game.posts.map((post) => (
                <FeedPost key={post.id} game={game} post={post} onLike={() => like(post.id)} onComments={() => setActiveId(post.id)} />
              )) : <div className="feed-empty"><span aria-hidden="true">◌</span><h2>Akış sessiz</h2><p>Çevrende henüz yeni bir paylaşım yok.</p></div>}
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
