import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          name="description"
          content="A highly customizable homepage (or startpage / application dashboard) with Docker and service API integrations."
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
        <link rel="manifest" href="/site.webmanifest?v=4" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=4" color="#1e9cd7" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
