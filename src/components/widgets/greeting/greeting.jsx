import classNames from "classnames";

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
    return (
      <div className={classNames(
        "flex flex-row items-center justify-start",
        options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
      )}>
        <span className={`text-theme-800 dark:text-theme-200 mr-3 ${textSizes[options.text_size || "xl"]}`}>
          {options.text}
        </span>
      </div>
    );
  }
}
