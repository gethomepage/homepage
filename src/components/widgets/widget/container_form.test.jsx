// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ContainerForm from "./container_form";

describe("components/widgets/widget/container_form", () => {
  it("calls callback on submit", () => {
    const cb = vi.fn((e) => e.preventDefault());

    const { container } = render(
      <ContainerForm options={{}} callback={cb}>
        {[<div key="c">child</div>]}
      </ContainerForm>,
    );

    const form = container.querySelector("form");
    fireEvent.submit(form);

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
