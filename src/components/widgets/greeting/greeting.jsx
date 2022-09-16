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
      <div className="flex flex-row items-center justify-start">
        <span className={`text-theme-800 dark:text-theme-200 ${textSizes[options.text_size || "xl"]}`}>
          {options.text}
        </span>
      </div>
    );
  }
}
