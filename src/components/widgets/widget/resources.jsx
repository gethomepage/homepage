import ContainerLink from "./container_link";
import Resource from "./resource";
import Raw from "./raw";
import WidgetLabel from "./widget_label";

export default function Resources({ options, children, target }) {
  const widgetParts = [].concat(...children);

  return <ContainerLink options={options} target={target}>
    <Raw>
      <div className="flex flex-row self-center flex-wrap justify-between">
        { widgetParts.filter(child => child && child.type === Resource) }
      </div>
      { widgetParts.filter(child => child && child.type === WidgetLabel) }
    </Raw>
  </ContainerLink>;
}
