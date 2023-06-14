import { getAllClasses, getInnerBlock, getBottomBlock } from "./container";

export default function ContainerButton ({ children = [], options, additionalClassNames = '', callback }) {
  return (
    <button type="button" onClick={callback} className={getAllClasses(options, additionalClassNames)}>
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </button>
  );
}
