import { useState, useEffect } from "react";

import Block from "./components/block";

import Container from "components/services/widget/container";

export default function Component({ service }) {
  const [refreshTimer, setRefreshTimer] = useState(0);

  const { widget } = service;
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {setRefreshTimer(refreshTimer + 1)},
      widget?.refreshInterval
    );
    return () => clearInterval(refreshInterval)
  }, [refreshTimer]);

  const scrollingDisableStyle = widget.scrolling
    ? "pointer-events:none; overflow: hidden;"
    : "";

  return (
    <Container service={service}>
      <Block>
        <iframe
          src={widget.src}
          id={refreshTimer}
          key={refreshTimer}
          title="Iframe"
          allow={widget?.allowPolicy}
          allowfullscreen={widget?.allowfullscreen}
          referrerpolicy={widget?.referrerPolicy}
          loading={widget?.loadingStrategy}
          scrolling={widget?.allowScrolling}
          frameBorder={widget?.border}
          style={{ width: "100%", scrollingDisableStyle }}
          className={`h-${widget.sizes?.xs} sm:h-${widget.sizes?.sm} md:h-${widget.sizes?.md} lg:h-${widget.sizes?.lg} xl:h-${widget.sizes?.xl} 2xl:h-${widget.sizes?.["2xl"]} ${scrollingDisableStyle}`}
        />
      </Block>
    </Container>
  );
}
