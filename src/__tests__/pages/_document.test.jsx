import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/document", () => ({
  Html: ({ children }) => <div data-testid="html">{children}</div>,
  Head: ({ children }) => <div data-testid="head">{children}</div>,
  Main: () => <main data-testid="main" />,
  NextScript: () => <script data-testid="nextscript" />,
}));

import Document from "pages/_document.jsx";

describe("pages/_document", () => {
  it("renders the PWA meta + custom css links", () => {
    const html = renderToStaticMarkup(<Document />);

    expect(html).toContain('meta name="mobile-web-app-capable" content="yes"');
    expect(html).toContain('link rel="manifest" href="/site.webmanifest?v=4"');
    expect(html).toContain('link rel="preload" href="/api/config/custom.css" as="style"');
    expect(html).toContain('link rel="stylesheet" href="/api/config/custom.css"');
    expect(html).toContain('data-testid="main"');
    expect(html).toContain('data-testid="nextscript"');
  });
});
