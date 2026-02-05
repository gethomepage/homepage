// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { getSettingsMock } = vi.hoisted(() => ({
  getSettingsMock: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  getSettings: getSettingsMock,
}));

import { getProviders } from "next-auth/react";
import SignInPage, { getServerSideProps } from "pages/auth/signin";

describe("pages/auth/signin", () => {
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

    expect(screen.getByText("Authentication not configured")).toBeInTheDocument();

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

  it("getServerSideProps returns providers and settings", async () => {
    getProviders.mockResolvedValueOnce({ foo: { id: "foo", name: "Foo" } });
    getSettingsMock.mockReturnValueOnce({ theme: "dark" });

    const res = await getServerSideProps({});

    expect(getProviders).toHaveBeenCalled();
    expect(getSettingsMock).toHaveBeenCalled();
    expect(res).toEqual({
      props: {
        providers: { foo: { id: "foo", name: "Foo" } },
        settings: { theme: "dark" },
      },
    });
  });
});
