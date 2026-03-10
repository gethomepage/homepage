// @vitest-environment jsdom

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Snippets from "./snippets";

describe("components/widgets/snippets", () => {
  it("renders snippet groups with commands", () => {
    const options = {
      groups: [
        {
          name: "Docker",
          items: [
            { command: "docker ps", description: "List containers" },
            { command: "docker compose up -d", description: "Start services" },
          ],
        },
      ],
    };

    renderWithProviders(<Snippets options={options} />, { settings: { target: "_self" } });

    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("docker ps")).toBeInTheDocument();
    expect(screen.getByText("docker compose up -d")).toBeInTheDocument();
    expect(screen.getByText("List containers")).toBeInTheDocument();
  });

  it("renders multiple groups", () => {
    const options = {
      groups: [
        { name: "Group A", items: [{ command: "cmd-a" }] },
        { name: "Group B", items: [{ command: "cmd-b" }] },
      ],
    };

    renderWithProviders(<Snippets options={options} />, { settings: { target: "_self" } });

    expect(screen.getByText("Group A")).toBeInTheDocument();
    expect(screen.getByText("Group B")).toBeInTheDocument();
    expect(screen.getByText("cmd-a")).toBeInTheDocument();
    expect(screen.getByText("cmd-b")).toBeInTheDocument();
  });

  it("copies command to clipboard on button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const options = {
      groups: [{ name: "Test", items: [{ command: "echo hello", description: "Say hello" }] }],
    };

    renderWithProviders(<Snippets options={options} />, { settings: { target: "_self" } });

    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("echo hello");
  });

  it("renders nothing when groups is empty", () => {
    const { container } = renderWithProviders(<Snippets options={{ groups: [] }} />, {
      settings: { target: "_self" },
    });
    expect(container.innerHTML).toBe("");
  });

  it("renders snippets without group name", () => {
    const options = {
      groups: [{ items: [{ command: "whoami" }] }],
    };

    renderWithProviders(<Snippets options={options} />, { settings: { target: "_self" } });

    expect(screen.getByText("whoami")).toBeInTheDocument();
  });
});
