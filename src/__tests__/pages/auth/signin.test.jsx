// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSettingsMock, authOptionsMock, signInMock, replaceMock, routerQuery } = vi.hoisted(() => ({
  getSettingsMock: vi.fn(),
  authOptionsMock: vi.fn(),
  signInMock: vi.fn(),
  replaceMock: vi.fn(),
  routerQuery: {},
}));

vi.mock("utils/config/config", () => ({
  getSettings: getSettingsMock,
}));

vi.mock("pages/api/auth/[...nextauth]", () => ({
  get authOptions() {
    return authOptionsMock();
  },
}));

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: routerQuery,
    replace: replaceMock,
  }),
}));

vi.mock("next-auth/react", () => ({ signIn: signInMock }));

import SignInPage, { getServerSideProps } from "pages/auth/signin";

const OIDC_PROVIDERS = { "homepage-oidc": { id: "homepage-oidc", name: "Homepage OIDC", type: "oauth" } };
const SETTINGS = { theme: "dark", color: "slate", title: "Homepage" };

describe("pages/auth/signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(routerQuery).forEach((key) => delete routerQuery[key]);
    window.sessionStorage.clear();
  });

  it("renders an error state when no providers are configured", async () => {
    render(
      <SignInPage
        providers={{}}
        settings={{
          theme: "dark",
          color: "slate",
          title: "Homepage",
        }}
      />,
    );

    expect(screen.getByText("Authentication error")).toBeInTheDocument();

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("scheme-dark")).toBe(true);
      expect(document.documentElement.classList.contains("theme-slate")).toBe(true);
    });
  });

  it("renders provider buttons when providers are available", () => {
    render(
      <SignInPage
        providers={{
          oidc: { id: "oidc", name: "OIDC" },
        }}
        settings={{
          theme: "light",
          color: "emerald",
          title: "My Dashboard",
        }}
      />,
    );

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login via oidc/i })).toBeInTheDocument();
  });

  it("redirects to the provider when auto-login is enabled", () => {
    routerQuery.callbackUrl = "/some/page";

    render(<SignInPage providers={OIDC_PROVIDERS} settings={SETTINGS} autoLogin />);

    expect(signInMock).toHaveBeenCalledWith("homepage-oidc", { callbackUrl: "/some/page" });
    expect(screen.getByText(/redirecting to homepage oidc/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /login via/i })).not.toBeInTheDocument();
  });

  it("does not auto-login when the provider returned an error", () => {
    routerQuery.error = "OAuthCallback";

    render(<SignInPage providers={OIDC_PROVIDERS} settings={SETTINGS} autoLogin />);

    expect(signInMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /login via homepage oidc/i })).toBeInTheDocument();
  });

  it("does not auto-login when it is explicitly disabled in the url", () => {
    routerQuery.autologin = "0";

    render(<SignInPage providers={OIDC_PROVIDERS} settings={SETTINGS} autoLogin />);

    expect(signInMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /login via homepage oidc/i })).toBeInTheDocument();
  });

  it("redirects once under strict mode, rather than tripping its own loop guard", () => {
    render(
      <StrictMode>
        <SignInPage providers={OIDC_PROVIDERS} settings={SETTINGS} autoLogin />
      </StrictMode>,
    );

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("stops auto-login and hands back the page when the session never sticks", () => {
    routerQuery.callbackUrl = "/some/page";

    render(<SignInPage providers={OIDC_PROVIDERS} settings={SETTINGS} autoLogin />);
    render(<SignInPage providers={OIDC_PROVIDERS} settings={SETTINGS} autoLogin />);

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/auth/signin?autologin=0&callbackUrl=%2Fsome%2Fpage");
  });

  it("does not auto-login the password provider", () => {
    render(
      <SignInPage
        providers={{ credentials: { id: "credentials", name: "Password", type: "credentials" } }}
        settings={SETTINGS}
        autoLogin
      />,
    );

    expect(signInMock).not.toHaveBeenCalled();
  });

  it("getServerSideProps returns providers and only public sign-in settings", async () => {
    authOptionsMock.mockReturnValueOnce({ providers: [{ id: "foo", name: "Foo", type: "oauth" }] });
    getSettingsMock.mockReturnValueOnce({
      theme: "dark",
      color: "slate",
      title: "Homepage",
      background: { image: "background.jpg", opacity: 20 },
      backgroundOpacity: 10,
      providers: {
        longhorn: {
          username: "admin",
          password: "secret",
        },
      },
      layout: { Internal: { style: "row" } },
    });

    const res = await getServerSideProps({});

    expect(getSettingsMock).toHaveBeenCalled();
    expect(res).toEqual({
      props: {
        autoLogin: false,
        providers: { foo: { id: "foo", name: "Foo", type: "oauth" } },
        settings: {
          theme: "dark",
          color: "slate",
          title: "Homepage",
          background: { image: "background.jpg", opacity: 20 },
          backgroundOpacity: 10,
        },
      },
    });
    expect(res.props.settings).not.toHaveProperty("providers");
    expect(res.props.settings).not.toHaveProperty("layout");
  });

  it("getServerSideProps enables auto-login from the environment", async () => {
    authOptionsMock.mockReturnValueOnce({ providers: [] });
    getSettingsMock.mockReturnValueOnce({ theme: "dark" });
    vi.stubEnv("HOMEPAGE_OIDC_AUTO_LOGIN", "true");

    const res = await getServerSideProps({});

    expect(res.props.autoLogin).toBe(true);
    vi.unstubAllEnvs();
  });

  it("getServerSideProps falls back to no providers when auth options fail to load", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    authOptionsMock.mockImplementationOnce(() => {
      throw new Error("Homepage auth is enabled but HOMEPAGE_EXTERNAL_URL (or NEXTAUTH_URL) is missing.");
    });
    getSettingsMock.mockReturnValueOnce({ theme: "dark" });

    const res = await getServerSideProps({});

    expect(res.props.providers).toEqual({});
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("getServerSideProps passes only id, name and type from each provider", async () => {
    authOptionsMock.mockReturnValueOnce({
      providers: [
        {
          id: "homepage-oidc",
          name: "Homepage OIDC",
          type: "oauth",
          issuer: "https://oidc.example",
          clientId: "canary-client-id",
          clientSecret: "canary-client-secret",
          wellKnown: "https://oidc.example/.well-known/openid-configuration",
          authorization: { params: { scope: "openid email profile" } },
          profile: () => ({}),
        },
        {
          id: "credentials",
          name: "Password",
          type: "credentials",
          credentials: { password: { label: "Password", type: "password" } },
          authorize: () => null,
        },
      ],
    });
    getSettingsMock.mockReturnValueOnce({ theme: "dark" });

    const res = await getServerSideProps({});

    expect(res.props.providers).toEqual({
      "homepage-oidc": { id: "homepage-oidc", name: "Homepage OIDC", type: "oauth" },
      credentials: { id: "credentials", name: "Password", type: "credentials" },
    });
    // These props get serialized into the sign-in page, which is unauthenticated
    expect(JSON.stringify(res.props)).not.toMatch(/canary-client-secret|canary-client-id|oidc\.example/);
  });
});
