import { getAllClasses, getInnerBlock, getBottomBlock } from "./container";

export default function ContainerForm ({ children = [], options, additionalClassNames = '', callback }) {
  return (
    <form type="button" onSubmit={callback} className={getAllClasses(options, additionalClassNames)}>
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </form>
  );
}
