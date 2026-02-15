// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ContainerButton from "./container_button";
import Raw from "./raw";

describe("components/widgets/widget/container_button", () => {
  it("invokes callback on click", () => {
    const cb = vi.fn();
    render(
      <ContainerButton options={{}} callback={cb}>
        <Raw>
          <div>child</div>
        </Raw>
      </ContainerButton>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
