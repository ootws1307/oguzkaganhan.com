import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { signInWithGithub } from "./actions";

export const metadata: Metadata = { title: "Giriş" };

const ERRORS: Record<string, string> = {
  oauth: "GitHub'a yönlendirilemedi. Birazdan tekrar dene.",
  callback: "Giriş tamamlanamadı. Tekrar dene.",
  denied: "Bu GitHub hesabının panele erişimi yok.",
  forbidden: "Oturumun var ama yönetici değilsin.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <div className="w-full max-w-sm border border-ink">
        <div className="caps flex items-baseline justify-between border-b border-ink px-4 py-2.5 text-sm">
          <span>Yönetim</span>
          <span className="text-ink-soft">oguzkaganhan.com</span>
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-semibold tracking-[-0.02em]">Giriş</h1>
          <p className="mt-3 text-ink-soft">
            Bu panele yalnızca site sahibinin GitHub hesabıyla girilebilir.
          </p>
          {message && (
            <p role="alert" className="mt-4 border-l border-signal pl-3 text-signal">
              {message}
            </p>
          )}
          <form action={signInWithGithub} className="mt-6">
            <Button type="submit" size="lg" className="caps h-11 w-full text-xs">
              {/* One flex item, or the button's gap would open inside the label. */}
              <span>
                <span lang="en">GitHub</span> ile giriş yap
              </span>
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
