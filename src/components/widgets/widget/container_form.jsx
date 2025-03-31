import { getAllClasses, getBottomBlock, getInnerBlock } from "./container";

export default function ContainerForm({ children = [], options, additionalClassNames = "", callback }) {
  return (
    <form onSubmit={callback} className={`${getAllClasses(options, additionalClassNames)} information-widget-form`}>
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </form>
  );
}
