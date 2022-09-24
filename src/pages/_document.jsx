import { Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <body className="relative w-full h-full bg-theme-50 dark:bg-theme-800 transition duration-150 ease-in-out">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
