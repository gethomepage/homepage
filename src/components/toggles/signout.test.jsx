// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signOut, useSession } = vi.hoisted(() => ({
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ signOut, useSession }));
vi.mock("next-i18next/pages", () => ({ useTranslation: () => ({ t: (key) => key }) }));

import SignOut from "./signout";

describe("components/toggles/signout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["unauthenticated", "loading"])("renders nothing when session status is %s", (status) => {
    useSession.mockReturnValue({ status });

    const { container } = render(<SignOut />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders and signs out when authenticated", () => {
    useSession.mockReturnValue({ status: "authenticated" });

    const { getByRole } = render(<SignOut />);
    fireEvent.click(getByRole("button"));

    // Not "/", which would bounce straight back into the provider when auto-login is on
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/auth/signin?autologin=0" });
  });
});
