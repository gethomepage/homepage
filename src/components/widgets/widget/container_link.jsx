import { getAllClasses, getInnerBlock, getBottomBlock } from "./container";

export default function ContainerLink({ children = [], options, additionalClassNames = "", target }) {
  return (
    <a
      href={options.href || options.url}
      target={target}
      className={`${getAllClasses(options, additionalClassNames)} information-widget-link`}
    >
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </a>
  );
}
