import type { ReactNode } from "react";
import type { AppId } from "../../core/model";
import { appTone } from "../appMeta";

function Symbol({ app }: { app: AppId }) {
  const paths: Partial<Record<AppId, ReactNode>> = {
    chat: (
      <>
        <path d="M13 14h28a7 7 0 0 1 7 7v13a7 7 0 0 1-7 7H27l-10 7 2-7h-6a7 7 0 0 1-7-7V21a7 7 0 0 1 7-7Z" />
        <circle cx="20" cy="28" r="2" />
        <circle cx="28" cy="28" r="2" />
        <circle cx="36" cy="28" r="2" />
      </>
    ),
    bank: (
      <>
        <path d="M9 22 28 11l19 11M12 25h32M15 27v14m9-14v14m9-14v14m9-14v14M10 44h36" />
        <path d="M34 16h9v6" />
      </>
    ),
    market: (
      <>
        <path d="M10 22h36l-3-10H13Z" />
        <path d="M13 22v23h30V22M20 45V32h16v13" />
        <path d="M9 22c0 5 7 6 9 1 2 5 8 5 10 0 2 5 8 5 10 0 2 5 8 4 9-1" />
      </>
    ),
    school: (
      <>
        <path d="m7 24 21-11 21 11-21 11Z" />
        <path d="M15 29v10c8 6 18 6 26 0V29M47 25v14" />
      </>
    ),
    career: (
      <>
        <rect x="9" y="17" width="38" height="28" rx="5" />
        <path d="M21 17v-5h14v5M9 29c10 6 28 6 38 0M24 29h8" />
      </>
    ),
    calendar: (
      <>
        <rect x="9" y="11" width="38" height="36" rx="6" />
        <path d="M9 22h38M18 8v7m20-7v7M18 30h8v8h-8zm13 0h8v8h-8z" />
      </>
    ),
    mail: (
      <>
        <rect x="7" y="13" width="42" height="32" rx="6" />
        <path d="m9 17 19 15 19-15M9 42l13-13m25 13L34 29" />
      </>
    ),
    map: (
      <>
        <path d="m9 16 12-6 14 6 12-6v32l-12 6-14-6-12 6Z" />
        <path d="M21 10v32m14-26v32M28 20c6 0 8 7 0 15-8-8-6-15 0-15Z" />
      </>
    ),
    news: (
      <>
        <path d="M12 10h34v37H12a5 5 0 0 1-5-5V17" />
        <path d="M17 18h19M17 25h20M17 33h9m5 0h8M17 40h19" />
      </>
    ),
    stocks: (
      <>
        <path d="M8 44h40M11 39l10-11 8 6 15-19" />
        <path d="M35 15h9v9" />
      </>
    ),
    feed: (
      <>
        <circle cx="28" cy="28" r="7" />
        <path d="M28 9c10 0 19 9 19 19S38 47 28 47 9 38 9 28 18 9 28 9Z" />
        <path d="M14 16c9 3 19 3 28 0M14 40c9-3 19-3 28 0" />
      </>
    ),
    notes: (
      <>
        <path d="M13 9h30v38H13Z" />
        <path d="M19 18h18M19 25h18M19 32h12M10 15h6m-6 8h6m-6 8h6m-6 8h6" />
      </>
    ),
    archive: (
      <>
        <path d="M10 14h16c5 0 7 3 7 7v26H17c-4 0-7-3-7-7Zm36 0H30" />
        <path d="M21 24c-5-5-10 2 0 9 10-7 5-14 0-9Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="28" cy="28" r="8" />
        <path d="M28 8v7m0 26v7M8 28h7m26 0h7M14 14l5 5m18 18 5 5m0-28-5 5M19 37l-5 5" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 56 56"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect className="icon-field" x="5" y="5" width="46" height="46" rx="15" />
      {paths[app] || <path d="M12 42V15l16 14 16-14v27" />}
    </svg>
  );
}
export function AppIcon({
  app,
  size = "regular",
}: {
  app: AppId;
  size?: "small" | "regular";
}) {
  return (
    <span
      className={`authored-icon icon-${app} tone-${appTone[app]} ${size === "small" ? "is-small" : ""}`}
      aria-hidden="true"
    >
      <Symbol app={app} />
    </span>
  );
}
