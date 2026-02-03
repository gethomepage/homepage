// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// next/image requires Next runtime features; stub it for component tests.
vi.mock("next/image", () => ({
  default: (props) => {
    const { src, alt, objectFit, className, onError } = props;
    // This is a unit-test stub for next/image; using <img> is intentional here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} data-object-fit={objectFit} className={className} onError={onError} />;
  },
}));

import Component from "./component";

describe("widgets/mjpeg/component", () => {
  it("renders the stream images", () => {
    render(<Component service={{ widget: { type: "mjpeg", stream: "http://example/stream.jpg", fit: "cover" } }} />);

    const imgs = screen.getAllByAltText("stream");
    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute("src")).toBe("http://example/stream.jpg");
    expect(imgs[1].getAttribute("src")).toBe("http://example/stream.jpg");

    // Both renders pass through objectFit; the first is "fill", the second uses widget.fit.
    expect(imgs[0].getAttribute("data-object-fit")).toBe("fill");
    expect(imgs[1].getAttribute("data-object-fit")).toBe("cover");
  });
});
