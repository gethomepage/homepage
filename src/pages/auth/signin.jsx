import classNames from "classnames";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { BiShieldQuarter } from "react-icons/bi";

import { getSettings } from "utils/config/config";

const PUBLIC_SIGN_IN_SETTINGS = ["theme", "color", "title", "background", "backgroundOpacity"];
const AUTO_LOGIN_COOKIE = "homepage-autologin-attempt";
const AUTO_LOGIN_RETRY_SECONDS = 10;

export default function SignIn({ providers, settings, autoLogin }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const theme = settings?.theme || "dark";
  const color = settings?.color || "slate";
  const title = settings?.title || "Homepage";
  const callbackUrl = useMemo(() => {
    const value = router.query?.callbackUrl;
    return typeof value === "string" ? value : "/";
  }, [router.query?.callbackUrl]);
  const error = router.query?.error;

  const oidcProvider = useMemo(
    () => Object.values(providers ?? {}).find((provider) => provider.type !== "credentials"),
    [providers],
  );
  // Try to avoid auto-login loop, e.g. if there was an error (or explicitly disabled via query param)
  const autoLoginBlocked = Boolean(error) || router.query?.autologin === "0";
  const redirecting = Boolean(autoLogin && oidcProvider && !autoLoginBlocked);

  useEffect(() => {
    if (!redirecting) return;

    // getServerSideProps drops autoLogin while this is set, so a bounce loop falls back to the button
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${AUTO_LOGIN_COOKIE}=1; path=/auth; max-age=${AUTO_LOGIN_RETRY_SECONDS}; samesite=lax${secure}`;

    signIn(oidcProvider.id, { callbackUrl });
  }, [redirecting, oidcProvider, callbackUrl]);

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
            <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-slate-100">Authentication error</h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">Auth is disabled or misconfigured.</p>
          </div>
        </main>
      </>
    );
  }

  const passwordProvider = providers
    ? Object.values(providers).find((provider) => provider.type === "credentials")
    : null;
  const hasPasswordProvider = Boolean(passwordProvider);

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
                  {redirecting && (
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      Redirecting to {oidcProvider?.name}&hellip;
                    </p>
                  )}
                  {!redirecting && hasPasswordProvider && (
                    <form
                      className="space-y-3"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        await signIn(passwordProvider?.id ?? "credentials", {
                          redirect: true,
                          callbackUrl,
                          password,
                        });
                      }}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none ring-0 transition focus:border-theme-500 focus:ring-2 focus:ring-theme-500/30 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                        required
                      />
                      <button
                        type="submit"
                        className="group w-full rounded-xl bg-theme-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-theme-600/20 transition hover:-translate-y-0.5 hover:bg-theme-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-500"
                      >
                        <span className="flex items-center justify-center gap-2">Sign in &rarr;</span>
                      </button>
                    </form>
                  )}
                  {!redirecting &&
                    !hasPasswordProvider &&
                    Object.values(providers).map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => signIn(provider.id, { callbackUrl })}
                        className="group w-full rounded-xl bg-theme-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-theme-600/20 transition hover:-translate-y-0.5 hover:bg-theme-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-500"
                      >
                        <span className="flex items-center justify-center gap-2">Login via {provider.name} &rarr;</span>
                      </button>
                    ))}
                </div>
                {hasPasswordProvider && error && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200">
                    Invalid password. Please try again.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  // Avoid getProviders() fetch
  let providers = {};
  try {
    // Dynamic so a bad config throws in here rather than at page load
    const { authOptions } = await import("pages/api/auth/[...nextauth]");
    providers = Object.fromEntries(authOptions.providers.map(({ id, name, type }) => [id, { id, name, type }]));
  } catch (e) {
    console.error("Unable to load auth providers: %s", e.message);
  }

  const homepageSettings = getSettings();
  const settings = Object.fromEntries(
    PUBLIC_SIGN_IN_SETTINGS.filter((key) => Object.prototype.hasOwnProperty.call(homepageSettings, key)).map((key) => [
      key,
      homepageSettings[key],
    ]),
  );
  // A pending attempt means the previous redirect never established a session
  const autoLoginAttempted = context.req?.cookies?.[AUTO_LOGIN_COOKIE] === "1";

  return {
    props: {
      providers,
      settings,
      autoLogin: process.env.HOMEPAGE_OIDC_AUTO_LOGIN === "true" && !autoLoginAttempted,
    },
  };
}
