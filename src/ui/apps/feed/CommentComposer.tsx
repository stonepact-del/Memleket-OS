import { useState } from "react";
import { Send } from "lucide-react";
export function CommentComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const clean = text.trim();
  return <form className="comment-composer" onSubmit={(event) => { event.preventDefault(); if (!clean) return; onSend(clean); setText(""); }}>
    <label className="sr-only" htmlFor="feed-comment">Yorum</label><input id="feed-comment" aria-label="Yorum" value={text} onChange={(event) => setText(event.target.value)} placeholder="Bir yorum bırak…" autoComplete="off" /><button disabled={!clean} aria-label="Yorumu gönder"><Send /></button>
  </form>;
}
