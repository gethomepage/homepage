import { getAllClasses, getBottomBlock, getInnerBlock } from "./container";

export default function ContainerButton({ children = [], options, additionalClassNames = "", callback }) {
  return (
    <button
      type="button"
      onClick={callback}
      className={`${getAllClasses(options, additionalClassNames)} information-widget-container-button`}
    >
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </button>
  );
}
