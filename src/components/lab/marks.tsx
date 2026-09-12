import type { GameId, KernelId } from "@/lib/games/catalog";
import { gameById } from "@/lib/games/catalog";

export function GameMark({ id }: { id: GameId }) {
  const g = gameById(id);
  const kind = g?.kernel ?? "custom";
  return <Mark kind={id === "cannon" || id === "orbit" || id === "dna" || id === "market" || id === "chord" || id === "era" ? id : kind} />;
}

function Mark({ kind }: { kind: string }) {
  const common = {
    viewBox: "0 0 80 80",
    className: "size-full",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
  } as const;

  switch (kind as KernelId | "cannon" | "orbit" | "dna" | "market" | "chord" | "era") {
    case "cannon":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 58c18-28 38-40 56-44" strokeDasharray="3 3" />
          <circle cx="68" cy="16" r="3" fill="currentColor" stroke="none" />
          <rect x="8" y="52" width="22" height="8" rx="2" />
          <path d="M18 52 L40 44" />
        </svg>
      );
    case "orbit":
      return (
        <svg {...common} aria-hidden>
          <circle cx="40" cy="40" r="10" />
          <ellipse cx="40" cy="40" rx="28" ry="16" />
          <circle cx="68" cy="40" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "dna":
      return (
        <svg {...common} aria-hidden>
          <path d="M28 12c16 8 16 20 0 28s-16 20 0 28" />
          <path d="M52 12c-16 8-16 20 0 28s16 20 0 28" />
          <path d="M30 22h20M28 36h24M30 50h20" />
        </svg>
      );
    case "market":
      return (
        <svg {...common} aria-hidden>
          <path d="M14 62 V18 H66" />
          <path d="M18 24 L62 52" />
          <path d="M18 56 L62 28" />
          <path d="M14 40 H66" strokeDasharray="3 3" />
        </svg>
      );
    case "chord":
      return (
        <svg {...common} aria-hidden>
          <rect x="16" y="22" width="10" height="38" />
          <rect x="28" y="22" width="10" height="38" />
          <rect x="40" y="22" width="10" height="38" />
          <rect x="52" y="22" width="10" height="38" />
          <rect x="24" y="22" width="7" height="22" fill="currentColor" />
          <rect x="36" y="22" width="7" height="22" fill="currentColor" />
        </svg>
      );
    case "era":
    case "bins":
      return (
        <svg {...common} aria-hidden>
          <path d="M16 28h48M16 40h48M16 52h48" />
          <rect x="22" y="24" width="10" height="8" />
          <rect x="40" y="36" width="10" height="8" />
          <rect x="30" y="48" width="10" height="8" />
        </svg>
      );
    case "bond":
      return (
        <svg {...common} aria-hidden>
          <circle cx="28" cy="40" r="10" />
          <circle cx="54" cy="40" r="10" />
          <path d="M38 40h6" />
        </svg>
      );
    case "plates":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 48c10-18 18-10 28-4s18 10 28-6" />
          <path d="M14 58c12-6 22 2 32 0s20-8 20-8" />
        </svg>
      );
    case "sketch":
      return (
        <svg {...common} aria-hidden>
          <path d="M14 58 V18 H66" />
          <path d="M18 50 C32 50 32 22 48 22 S64 46 66 46" />
          <circle cx="32" cy="36" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="48" cy="22" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...common} aria-hidden>
          <circle cx="20" cy="40" r="6" />
          <circle cx="40" cy="40" r="6" />
          <circle cx="60" cy="40" r="6" />
          <path d="M26 40h8M46 40h8" />
        </svg>
      );
    case "fit":
      return (
        <svg {...common} aria-hidden>
          <path d="M14 62 V18 H66" />
          <rect x="22" y="44" width="8" height="18" />
          <rect x="32" y="32" width="8" height="30" />
          <rect x="42" y="28" width="8" height="34" />
          <rect x="52" y="40" width="8" height="22" />
        </svg>
      );
    case "runway":
      return (
        <svg {...common} aria-hidden>
          <path d="M16 58 H64" />
          <path d="M20 58 V34h8V58M36 58 V26h8V58M52 58 V40h8V58" />
        </svg>
      );
    case "allocate":
      return (
        <svg {...common} aria-hidden>
          <rect x="14" y="30" width="52" height="20" />
          <path d="M32 30v20M50 30v20" />
        </svg>
      );
    case "funnel":
      return (
        <svg {...common} aria-hidden>
          <path d="M18 20h44L48 40H32z" />
          <path d="M36 40v20" />
          <circle cx="28" cy="16" r="2" fill="currentColor" stroke="none" />
          <circle cx="44" cy="14" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "route":
      return (
        <svg {...common} aria-hidden>
          <rect x="12" y="34" width="16" height="12" />
          <rect x="32" y="34" width="16" height="12" />
          <rect x="52" y="34" width="16" height="12" />
          <path d="M28 40h4M48 40h4" />
        </svg>
      );
    case "wire":
      return (
        <svg {...common} aria-hidden>
          <circle cx="22" cy="28" r="6" />
          <circle cx="58" cy="28" r="6" />
          <circle cx="40" cy="56" r="6" />
          <path d="M26 32 L36 52M54 32 L44 52" />
        </svg>
      );
    case "place":
      return (
        <svg {...common} aria-hidden>
          <rect x="16" y="16" width="48" height="48" />
          <rect x="24" y="24" width="14" height="14" />
          <rect x="42" y="42" width="14" height="14" />
        </svg>
      );
    case "stack":
      return (
        <svg {...common} aria-hidden>
          <path d="M22 54h36M22 44h16M42 44h16M22 34h36M22 24h16M42 24h16" />
        </svg>
      );
    case "order":
      return (
        <svg {...common} aria-hidden>
          <rect x="16" y="22" width="18" height="12" />
          <rect x="40" y="22" width="24" height="12" />
          <rect x="16" y="40" width="28" height="12" />
          <rect x="48" y="40" width="16" height="12" />
        </svg>
      );
    case "logic":
      return (
        <svg {...common} aria-hidden>
          <rect x="18" y="18" width="44" height="44" />
          <path d="M18 32h44M18 46h44M32 18v44M46 18v44" />
        </svg>
      );
    case "steer":
      return (
        <svg {...common} aria-hidden>
          <circle cx="40" cy="40" r="6" />
          <path d="M40 18v10M40 52v10M18 40h10M52 40h10" />
        </svg>
      );
    case "listen":
      return (
        <svg {...common} aria-hidden>
          <path d="M28 32c8-10 16-10 24 0M24 40c12-16 20-16 32 0" />
          <circle cx="40" cy="50" r="4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "meter":
      return (
        <svg {...common} aria-hidden>
          <path d="M18 52a26 26 0 1 1 44 0" />
          <path d="M40 50 L54 32" />
          <circle cx="40" cy="50" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "stroop":
      return (
        <svg {...common} aria-hidden>
          <rect x="18" y="24" width="44" height="32" />
          <path d="M28 40h24" />
        </svg>
      );
    case "collect":
      return (
        <svg {...common} aria-hidden>
          <path d="M24 36h32l-4 20H28z" />
          <circle cx="32" cy="24" r="3" />
          <circle cx="48" cy="20" r="3" />
        </svg>
      );
    case "exposure":
    case "csat":
      return (
        <svg {...common} aria-hidden>
          <rect x="18" y="14" width="44" height="52" rx="2" />
          <path d="M26 26h28M26 36h28M26 46h20" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="40" cy="40" r="18" />
        </svg>
      );
  }
}
