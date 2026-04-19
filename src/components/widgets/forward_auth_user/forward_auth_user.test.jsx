// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import ForwardAuthUser from "./forward_auth_user";

describe("components/widgets/user_forward", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(<ForwardAuthUser options={{}} />);

    // Use queryByRole to check that the button hasn't appeared yet
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the username from API once loaded", () => {
    useSWR.mockReturnValue({
      data: { username: "captain_zero" },
      error: undefined,
    });

    renderWithProviders(<ForwardAuthUser options={{}} />);
    expect(screen.getByText("captain_zero")).toBeInTheDocument();
    expect(screen.queryByText("Signed in as")).not.toBeInTheDocument();
  });

  it("renders the toggle button but hides the menu by default", () => {
    useSWR.mockReturnValue({ data: { username: "testuser" }, error: undefined });

    renderWithProviders(<ForwardAuthUser options={{}} />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.queryByText("Signed in as")).not.toBeInTheDocument();
  });

  it("opens the dropdown menu when clicked", async () => {
    useSWR.mockReturnValue({
      data: { username: "testuser", email: "testuser@testuser.test" },
      error: undefined,
    });

    renderWithProviders(<ForwardAuthUser options={{}} />);

    const button = screen.getByRole("button");
    await fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Signed in as")).toBeInTheDocument();
      expect(screen.getByText("testuser@testuser.test")).toBeInTheDocument();
    });
  });

  it("renders dynamic actions with custom colors", async () => {
    const mockActions = [
      {
        text: "Settings",
        href: "/settings",
        icon: "hi-Cog",
        iconColor: "oklch(70% 0.1 20)",
      },
    ];

    useSWR.mockReturnValue({
      data: { username: "user", actions: mockActions },
      error: undefined,
    });

    renderWithProviders(<ForwardAuthUser options={{}} />);
    const button = screen.getByRole("button");
    await fireEvent.click(button);

    await waitFor(() => {
      const actionLink = screen.getByText("Settings");
      expect(actionLink.closest("a")).toHaveAttribute("href", "/settings");

      // Verify the color style was applied to the span/icon
      expect(actionLink).toHaveStyle({ color: "oklch(70% 0.1 20)" });
      expect(actionLink).toHaveStyle({ color: "oklch(70% 0.1 20)" });
    });
  });

  it("renders custom focus colors when the action is focused", async () => {
    const mockActions = [
      {
        text: "Settings",
        href: "/settings",
        icon: "hi-Cog",
        iconColor: "oklch(70% 0.1 20)",
        focusBgColor: "oklch(60% 0.2 25)",
      },
    ];

    useSWR.mockReturnValue({
      data: { username: "user", actions: mockActions },
      error: undefined,
    });

    renderWithProviders(<ForwardAuthUser options={{}} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const actionLink = await screen.findByText("Settings");
    const anchorElement = actionLink.closest("a");

    fireEvent.focus(anchorElement);
    await waitFor(() => {
      expect(anchorElement).toHaveStyle({ backgroundColor: "oklch(60% 0.2 25)" });
    });
  });
});
