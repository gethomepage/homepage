import { getAllClasses, getInnerBlock, getBottomBlock } from "./container";

export default function ContainerLink ({ children = [], options, additionalClassNames = '', target }) {
  return (
    <a href={options.url} target={target} className={getAllClasses(options, additionalClassNames)}>
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </a>
  );
}
