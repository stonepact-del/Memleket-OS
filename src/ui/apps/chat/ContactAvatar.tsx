import type { NPC } from "../../../core/model";
import { visualHash } from "../../visualHash";
const palettes = [
  ["#dec09e", "#784938", "#315f58", "#e5c979"],
  ["#c9d6b9", "#44372e", "#ba6752", "#5c8a87"],
  ["#efc4ac", "#6c443a", "#435b82", "#cf7d62"],
  ["#c6b09b", "#2f342f", "#a56d42", "#778eaf"],
  ["#d9b7a3", "#543f55", "#3c7168", "#d5a64a"],
  ["#e0c3a5", "#4a352e", "#724f83", "#73a190"],
];
export function avatarTraits(identity: string) {
  const h = visualHash(identity);
  return {
    palette: h % palettes.length,
    hair: (h >>> 3) % 4,
    clothes: (h >>> 6) % 3,
    background: (h >>> 9) % 3,
    glasses: (h >>> 12) % 5 === 0,
    feature: (h >>> 15) % 3,
  };
}
export function ContactAvatar({
  npc,
  small = false,
}: {
  npc: NPC;
  small?: boolean;
}) {
  const traits = avatarTraits(`${npc.id}:${npc.name}`),
    [skin, hair, shirt, accent] = palettes[traits.palette],
    hairPaths = [
      "M17 30c0-18 9-23 18-22 9 1 14 8 13 18-7-2-14-7-18-13-1 8-6 13-13 17Z",
      "M17 29c-1-14 6-22 17-22 12 0 17 9 14 22-4-10-13-11-19-14-2 7-6 11-12 14Z",
      "M16 31c-2-15 4-24 16-24 13 0 20 9 16 25l-6-15-7 7-8-8-4 15Z",
      "M18 27c2-15 11-20 22-17 8 3 11 11 8 22-5-10-9-14-15-17-4 8-9 11-15 12Z",
    ];
  return (
    <svg
      className={`contact-avatar ${small ? "small" : ""}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${npc.name} için stilize avatar`}
      data-avatar-variant={`${traits.palette}-${traits.hair}-${traits.clothes}-${traits.background}`}
    >
      <circle
        cx="32"
        cy="32"
        r="32"
        fill={traits.background === 0 ? shirt : accent}
      />
      {traits.background === 1 && (
        <path d="M-4 48 48-4h20v18L14 68H-4Z" fill={shirt} />
      )}{" "}
      {traits.background === 2 && (
        <circle cx="50" cy="12" r="24" fill={shirt} />
      )}
      <path
        d={
          traits.clothes === 0
            ? "M8 64c3-15 12-22 24-22s21 7 24 22"
            : "M5 64c7-17 16-22 27-22 12 0 21 6 27 22"
        }
        fill={shirt}
      />
      {traits.clothes === 2 && (
        <path
          d="m24 45 8 10 8-10"
          fill="none"
          stroke={accent}
          strokeWidth="4"
        />
      )}
      <ellipse cx="32" cy="29" rx="15" ry="18" fill={skin} />
      <path d={hairPaths[traits.hair]} fill={hair} />
      {traits.glasses && (
        <g fill="none" stroke="#3c403e" strokeWidth="2">
          <circle cx="25" cy="29" r="5" />
          <circle cx="40" cy="29" r="5" />
          <path d="M30 29h5" />
        </g>
      )}
      <path
        d={
          traits.feature === 0
            ? "M27 37c3 2 7 2 10 0"
            : traits.feature === 1
              ? "M28 37h8"
              : "M28 38c2-1 5-1 8 0"
        }
        fill="none"
        stroke="#8b5b50"
        strokeLinecap="round"
      />
    </svg>
  );
}
