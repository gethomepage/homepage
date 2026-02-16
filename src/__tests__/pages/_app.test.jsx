// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Next's Head implementation relies on internal Next contexts; stub it for unit tests.
vi.mock("next/head", () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock("utils/contexts/color", () => ({
  ColorProvider: ({ children }) => <>{children}</>,
}));
vi.mock("utils/contexts/theme", () => ({
  ThemeProvider: ({ children }) => <>{children}</>,
}));
vi.mock("utils/contexts/settings", () => ({
  SettingsProvider: ({ children }) => <>{children}</>,
}));
vi.mock("utils/contexts/tab", () => ({
  TabProvider: ({ children }) => <>{children}</>,
}));

import App from "pages/_app.jsx";

describe("pages/_app", () => {
  it("renders the active page component with pageProps", () => {
    function Page({ message }) {
      return <div>msg:{message}</div>;
    }

    render(<App Component={Page} pageProps={{ message: "hello" }} />);

    expect(screen.getByText("msg:hello")).toBeInTheDocument();
    expect(document.querySelector('meta[name="viewport"]')).toBeTruthy();
  });
});
