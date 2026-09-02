import { Heart, MessageCircle } from "lucide-react";
import type { State } from "../../../core/model";
import { date, time } from "../../format";
import { ContactAvatar } from "../chat/ContactAvatar";

type Post = State["posts"][number];
export function FeedPost({ game, post, onLike, onComments, detail = false }: { game: State; post: Post; onLike: () => void; onComments?: () => void; detail?: boolean }) {
  const npc = game.npcs.find((person) => person.id === post.npcId);
  if (!npc) return null;
  const today = post.at.slice(0, 10) === game.now.slice(0, 10);
  return <article className={`feed-post ${detail ? "feed-post-detail" : ""}`}>
    <header><ContactAvatar npc={npc} /><div><strong>{npc.name}</strong><time dateTime={post.at}>{today ? `Bugün · ${time(post.at)}` : date(post.at)}</time></div></header>
    <p>{post.text}</p>
    <footer>
      <button className={post.liked ? "liked" : ""} aria-pressed={post.liked} aria-label={post.liked ? "Beğeniyi kaldır" : "Beğen"} onClick={onLike}><Heart fill={post.liked ? "currentColor" : "none"} /><span>{post.likes} beğeni</span></button>
      {onComments && <button aria-label={`${post.comments.length} yorumu aç`} onClick={onComments}><MessageCircle /><span>{post.comments.length} yorum</span></button>}
    </footer>
  </article>;
}
