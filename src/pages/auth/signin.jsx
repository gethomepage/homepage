import classNames from "classnames";
import { getProviders, signIn } from "next-auth/react";
import { useEffect } from "react";
import { BiShieldQuarter } from "react-icons/bi";
import { getSettings } from "utils/config/config";

export default function SignIn({ providers, callbackUrl, settings }) {
  const theme = settings?.theme || "dark";
  const color = settings?.color || "slate";
  const title = settings?.title || "Homepage";

  let backgroundImage = "";
  let opacity = settings?.backgroundOpacity ?? 0;
  let backgroundBlur = false;
  let backgroundSaturate = false;
  let backgroundBrightness = false;

  if (settings?.background) {
    const bg = settings.background;
    if (typeof bg === "object") {
      backgroundImage = bg.image || "";
      if (bg.opacity !== undefined) {
        opacity = 1 - bg.opacity / 100;
      }
      backgroundBlur = bg.blur !== undefined;
      backgroundSaturate = bg.saturate !== undefined;
      backgroundBrightness = bg.brightness !== undefined;
    } else {
      backgroundImage = bg;
    }
  }

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("dark", "scheme-dark", "scheme-light");
    html.classList.toggle("dark", theme === "dark");
    html.classList.add(theme === "dark" ? "scheme-dark" : "scheme-light");

    const desiredThemeClass = `theme-${color}`;
    const themeClassesToRemove = Array.from(html.classList).filter(
      (cls) => cls.startsWith("theme-") && cls !== desiredThemeClass,
    );
    if (themeClassesToRemove.length) {
      html.classList.remove(...themeClassesToRemove);
    }
    if (!html.classList.contains(desiredThemeClass)) {
      html.classList.add(desiredThemeClass);
    }

    body.style.backgroundImage = "";
    body.style.backgroundColor = "";
    body.style.backgroundAttachment = "";
  }, [color, theme]);

  if (!providers || Object.keys(providers).length === 0) {
    return (
      <>
        {backgroundImage && (
          <div
            id="background"
            aria-hidden="true"
            style={{
              backgroundImage: `linear-gradient(rgb(var(--bg-color) / ${opacity}), rgb(var(--bg-color) / ${opacity})), url('${backgroundImage}')`,
            }}
          />
        )}
        <main
          className={classNames(
            "relative flex min-h-screen items-center justify-center px-6 py-12",
            backgroundBlur &&
              `backdrop-blur${settings?.background?.blur?.length ? `-${settings.background.blur}` : ""}`,
            backgroundSaturate && `backdrop-saturate-${settings.background.saturate}`,
            backgroundBrightness && `backdrop-brightness-${settings.background.brightness}`,
          )}
        >
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-10 text-center shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-slate-900/70">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-theme-500/20 via-theme-500/5 to-transparent"
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-500/15 text-theme-600 dark:text-theme-300">
              <BiShieldQuarter className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-slate-100">
              Authentication not configured
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">OIDC is disabled or misconfigured.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {backgroundImage && (
        <div
          id="background"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgb(var(--bg-color) / ${opacity}), rgb(var(--bg-color) / ${opacity})), url('${backgroundImage}')`,
          }}
        />
      )}
      <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div
          className={classNames(
            "relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70",
            backgroundBlur &&
              `backdrop-blur${settings?.background?.blur?.length ? `-${settings.background.blur}` : ""}`,
            backgroundSaturate && `backdrop-saturate-${settings.background.saturate}`,
            backgroundBrightness && `backdrop-brightness-${settings.background.brightness}`,
          )}
        >
          <div className="pointer-events-none absolute -left-24 -top-20 h-64 w-64 rounded-full bg-theme-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-theme-500/10 blur-3xl" />
          <div className="grid gap-10 px-8 py-12 md:grid-cols-[1.2fr_1fr] md:px-12">
            <section className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-theme-500/30 bg-theme-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-theme-600 dark:text-theme-300">
                  Login Required
                </div>
                <h1 className="mt-6 text-3xl font-semibold text-gray-900 dark:text-slate-100">{title}</h1>
                <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">Login to view your dashboard.</p>
              </div>
            </section>

            <section className="flex flex-col justify-center gap-6">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-slate-900/70">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Sign in</h2>
                <div className="mt-6 space-y-3">
                  {Object.values(providers).map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => signIn(provider.id, { callbackUrl: callbackUrl || "/" })}
                      className="group w-full rounded-xl bg-theme-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-theme-600/20 transition hover:-translate-y-0.5 hover:bg-theme-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-500"
                    >
                      <span className="flex items-center justify-center gap-2">Login via {provider.name} &rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  const callbackUrl = context?.query?.callbackUrl ?? "/";
  const settings = getSettings();
  return {
    props: { providers, callbackUrl, settings },
  };
}
