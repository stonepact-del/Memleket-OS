import { useEffect, useState } from "react";
import type { State } from "../../../core/model";
import { useGame } from "../../../store";
import { ConversationList } from "./ConversationList";
import { Conversation } from "./Conversation";
import "./chat.css";
export function ChatApp({ game }: { game: State }) {
  const send = useGame((x) => x.send),
    read = useGame((x) => x.readConversation),
    [active, setActive] = useState(game.npcs[0]?.id),
    [mobileThread, setMobileThread] = useState(false);
  useEffect(() => {
    if (active) read(active);
  }, [active, read]);
  const npc = game.npcs.find((x) => x.id === active);
  return (
    <div
      className={`chat-layout chat-native-layout ${mobileThread ? "thread-open" : ""}`}
      data-app-identity="chat-native"
    >
      <ConversationList
        npcs={game.npcs}
        messages={game.messages}
        active={active}
        onSelect={(id) => {
          setActive(id);
          setMobileThread(true);
          read(id);
        }}
      />
      {npc && (
        <Conversation
          npc={npc}
          messages={game.messages.filter((m) => m.npcId === active)}
          onBack={() => setMobileThread(false)}
          onSend={(text) => {
            send(npc.id, text);
            read(npc.id);
          }}
        />
      )}
    </div>
  );
}
