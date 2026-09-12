import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm">
        <p className="text-2xl font-semibold tracking-tight">Nanamate Lab</p>
        <h1 className="mt-3 text-lg font-medium">로그인</h1>
        <p className="mt-1 mb-6 text-sm text-muted">기록은 이 브라우저에 남습니다. 로그인은 선택입니다.</p>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-line-strong"
              >
                {p.label}로 계속
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">로그인이 꺼져 있습니다.</p>
        )}
        <Link to="/" className="mt-6 inline-block text-sm text-muted no-underline hover:text-fg">
          허브로 돌아가기
        </Link>
      </div>
    </main>
  );
}
