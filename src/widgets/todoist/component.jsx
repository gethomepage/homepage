import { useMemo } from "react";
import dynamic from "next/dynamic";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { widget } = service;

  // Load categories
  const categories = useMemo(
    () =>
      widget.categories
        ?.filter((category) => category?.sort)
        .map((category) => ({
          service: dynamic(() => import(`./categories/${category.sort}`)),
          widget: { ...widget, ...category },
          categoryName: category.category_name,
        })) ?? [],
    [widget]
  );

  return (
    <Container service={service}>
      <div className="flex flex-col w-full">
        <div className="sticky top-0">
          {categories.map((category) => {
            const Integration = category.service;
            const key = `integration-${category.widget.type}`;

            return (
              <div key={key}>
                <Block value={category.categoryName} />
                <Integration
                  widget={category.widget}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
