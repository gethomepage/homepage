import classNames from "classnames";

import ContainerLink from "./container_link";
import Raw from "./raw";
import Resource from "./resource";
import WidgetLabel from "./widget_label";

export default function Resources({ options, children, target, additionalClassNames }) {
  const widgetParts = [].concat(...children);
  const addedClassNames = classNames("information-widget-resources", additionalClassNames);

  return (
    <ContainerLink options={options} target={target} additionalClassNames={addedClassNames}>
      <Raw>
        <div className="flex flex-row self-center flex-wrap justify-between">
          {widgetParts.filter((child) => child && child.type === Resource)}
        </div>
        {widgetParts.filter((child) => child && child.type === WidgetLabel)}
      </Raw>
    </ContainerLink>
  );
}
