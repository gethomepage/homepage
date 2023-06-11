import ContainerLink from "./container_link";
import Resource from "./resource";
import Raw from "./raw";
import WidgetLabel from "./widget_label";

export default function Resources({ options, children, target }) {
  return <ContainerLink options={options} target={target}>
    <Raw>
      <div className="flex flex-row self-center flex-wrap justify-between">
        { children.filter(child => child && child.type === Resource) }
      </div>
      { children.filter(child => child && child.type === WidgetLabel) }
    </Raw>
  </ContainerLink>;
}
