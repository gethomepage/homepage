import Container from "../widget/container";
import Raw from "../widget/raw";

const textSizes = {
  "4xl": "text-4xl",
  "3xl": "text-3xl",
  "2xl": "text-2xl",
  xl: "text-xl",
  lg: "text-lg",
  md: "text-md",
  sm: "text-sm",
  xs: "text-xs",
};

export default function Greeting({ options }) {
  if (options.text) {
    return <Container options={options}>
      <Raw>
        <span className={`text-theme-800 dark:text-theme-200 mr-3 ${textSizes[options.text_size || "xl"]}`}>
          {options.text}
        </span>
      </Raw>
    </Container>;
  }
}
