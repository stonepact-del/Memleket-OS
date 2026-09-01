import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ChevronUp, LockKeyhole } from "lucide-react";
import type { State } from "../../core/model";
import { simulationTimeOfDay } from "../wallpaper";
import { appNames } from "../appMeta";
import { AppIcon } from "./AppIcon";
import { date, time } from "../format";
import { PhoneIndicators } from "./StatusBar";

const UNLOCK_THRESHOLD = 84;
const MAX_DRAG = 120;

export function LockScreen({
  game,
  unlock,
}: {
  game: State;
  unlock: () => void;
}) {
  const [dragDistance, setDragDistance] = useState(0);
  const dragDistanceRef = useRef(0);
  const startY = useRef<number | null>(null);
  const activePointer = useRef<number | null>(null);
  const next = game.events
    .filter((event) => !event.processed)
    .sort((a, b) => a.at.localeCompare(b.at))[0];
  const ready = dragDistance >= UNLOCK_THRESHOLD;

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (
      event.target instanceof Element &&
      event.target.closest("button, a, [role='button']")
    )
      return;
    startY.current = event.clientY;
    activePointer.current = event.pointerId;
    dragDistanceRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const updateDrag = (event: PointerEvent<HTMLElement>) => {
    if (activePointer.current !== event.pointerId || startY.current === null)
      return;
    const distance = Math.min(
      MAX_DRAG,
      Math.max(0, startY.current - event.clientY),
    );
    dragDistanceRef.current = distance;
    setDragDistance(distance);
  };
  const cancelDrag = (event: PointerEvent<HTMLElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    startY.current = null;
    dragDistanceRef.current = 0;
    setDragDistance(0);
  };
  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    if (activePointer.current !== event.pointerId) return;
    const shouldUnlock = dragDistanceRef.current >= UNLOCK_THRESHOLD;
    activePointer.current = null;
    startY.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (shouldUnlock) unlock();
    else {
      dragDistanceRef.current = 0;
      setDragDistance(0);
    }
  };
  return (
    <main
      className={`lock-screen ${dragDistance ? "is-dragging" : ""} ${game.settings.reducedMotion ? "reduce-motion" : ""} wallpaper-${game.settings.wallpaper} tod-${simulationTimeOfDay(game.now)}`}
      onPointerDown={startDrag}
      onPointerMove={updateDrag}
      onPointerUp={finishDrag}
      onPointerCancel={cancelDrag}
    >
      <div
        className="lock-surface"
        data-unlock-ready={ready}
        style={
          {
            "--unlock-progress": Math.min(1, dragDistance / UNLOCK_THRESHOLD),
            "--lock-lift": `${Math.min(68, dragDistance * 0.55)}px`,
          } as CSSProperties
        }
      >
        <div className="lock-status">
          <span>MemleketOS</span>
          <PhoneIndicators />
        </div>
        <section className="lock-clock">
          <LockKeyhole />
          <p>
            {date(game.now, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <time>{time(game.now)}</time>
          <small>{game.player.province} · hayat senin ritminde</small>
        </section>
        <section
          className="lock-notifications"
          aria-label="Bildirim önizlemeleri"
        >
          {game.notifications
            .filter((notification) => !notification.read)
            .slice(0, 2)
            .map((notification) => (
              <article key={notification.id}>
                <AppIcon app={notification.app} size="small" />
                <div>
                  <b>{appNames[notification.app]}</b>
                  <span>{notification.title}</span>
                  <p>{notification.body}</p>
                </div>
              </article>
            ))}
          {next && (
            <article>
              <AppIcon app="calendar" size="small" />
              <div>
                <b>Sırada</b>
                <span>{next.title}</span>
                <p>{date(next.at)}</p>
              </div>
            </article>
          )}
        </section>
        <button
          className="unlock"
          aria-label="Telefonun kilidini aç"
          onClick={unlock}
        >
          <ChevronUp aria-hidden="true" />
          <span>{ready ? "Bırak ve aç" : "Açmak için yukarı kaydır"}</span>
          <i aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
