// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("components/services/item", () => ({
  default: function ServiceItemMock({ service, groupName, useEqualHeights }) {
    return (
      <li data-testid="service-item">
        {groupName}:{service.name}:{String(useEqualHeights)}
      </li>
    );
  },
}));

import List from "./list";

describe("components/services/list", () => {
  it("renders items and passes the computed useEqualHeights value", () => {
    render(
      <List
        groupName="G"
        services={[{ name: "A" }, { name: "B" }]}
        layout={{ useEqualHeights: true }}
        useEqualHeights={false}
        header
      />,
    );

    const items = screen.getAllByTestId("service-item");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("G:A:true");
    expect(items[1]).toHaveTextContent("G:B:true");
  });
});
