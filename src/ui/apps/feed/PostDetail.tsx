import type { State } from "../../../core/model";
import { ContactAvatar } from "../chat/ContactAvatar";
import { FeedPost } from "./FeedPost";
import { CommentComposer } from "./CommentComposer";

export function PostDetail({ game, post, onBack, onLike, onComment }: { game: State; post: State["posts"][number]; onBack: () => void; onLike: () => void; onComment: (text: string) => void }) {
  return <section className="post-detail" aria-label="Gönderi ve yorumlar">
    <header><button onClick={onBack} aria-label="Akışa dön">‹</button><div><small>AKIŞ</small><h1>Yorumlar</h1></div></header>
    <div className="post-detail-scroll"><FeedPost game={game} post={post} onLike={onLike} detail />
      <section className="comment-list" aria-label="Yorumlar">
        <h2>{post.comments.length ? `${post.comments.length} yorum` : "İlk yorumu sen yaz"}</h2>
        {post.comments.map((comment) => { const npc = game.npcs.find((person) => person.id === comment.authorId); return <article key={comment.id}>{npc ? <ContactAvatar npc={npc} small /> : <span className="player-avatar" aria-hidden="true">S</span>}<div><strong>{comment.authorId === "player" ? "Sen" : npc?.name ?? "Yakın çevre"}</strong><p>{comment.text}</p></div></article>; })}
      </section>
    </div>
    <CommentComposer onSend={onComment} />
  </section>;
}
