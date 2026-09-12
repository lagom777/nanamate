import { Link } from "@tanstack/react-router";
import { GAMES } from "@/lib/games/catalog";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";

export function LabHeader({ compact = false }: { compact?: boolean }) {
  const { isPending } = useCurrentUserState();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-baseline gap-2 no-underline">
        <span className="text-lg font-semibold tracking-tight text-fg sm:text-xl">
          Nanamate
        </span>
        <span className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
          Lab
        </span>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {!compact && (
          <span className="hidden text-muted sm:inline">{GAMES.length}과목 · 각 9장</span>
        )}
        {isPending ? (
          <div className="h-8 w-20 animate-pulse rounded-sm bg-subtle" />
        ) : (
          <>
            <SignedOut>
              <Link
                to="/login"
                className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-fg no-underline hover:border-line-strong"
              >
                로그인
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </>
        )}
      </div>
    </header>
  );
}
