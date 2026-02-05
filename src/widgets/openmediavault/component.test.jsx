// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { ServicesGetStatus, SmartGetList, DownloaderGetDownloadList } = vi.hoisted(() => ({
  ServicesGetStatus: vi.fn(() => <div data-testid="services.getStatus" />),
  SmartGetList: vi.fn(() => <div data-testid="smart.getListBg" />),
  DownloaderGetDownloadList: vi.fn(() => <div data-testid="downloader.getDownloadList" />),
}));

vi.mock("./methods/services_get_status", () => ({ default: ServicesGetStatus }));
vi.mock("./methods/smart_get_list", () => ({ default: SmartGetList }));
vi.mock("./methods/downloader_get_downloadlist", () => ({ default: DownloaderGetDownloadList }));

import Component from "./component";

describe("widgets/openmediavault/component", () => {
  it("routes services.getStatus method to ServicesGetStatus", () => {
    render(<Component service={{ widget: { type: "openmediavault", method: "services.getStatus" } }} />);
    expect(screen.getByTestId("services.getStatus")).toBeInTheDocument();
  });

  it("routes smart.getListBg method to SmartGetList", () => {
    render(<Component service={{ widget: { type: "openmediavault", method: "smart.getListBg" } }} />);
    expect(screen.getByTestId("smart.getListBg")).toBeInTheDocument();
  });

  it("routes downloader.getDownloadList method to DownloaderGetDownloadList", () => {
    render(<Component service={{ widget: { type: "openmediavault", method: "downloader.getDownloadList" } }} />);
    expect(screen.getByTestId("downloader.getDownloadList")).toBeInTheDocument();
  });

  it("returns null for unknown methods", () => {
    const { container } = render(<Component service={{ widget: { type: "openmediavault", method: "nope" } }} />);
    expect(container.firstChild).toBeNull();
  });
});
