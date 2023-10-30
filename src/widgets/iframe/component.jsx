import { useState, useEffect } from "react";

import Block from "./components/block";

import Container from "components/services/widget/container";

export default function Component({ service }) {
  const [refreshTimer, setRefreshTimer] = useState(0);

  const { widget } = service;

  useEffect(() => {
    if (widget?.refreshInterval) {
      const refreshInterval = setInterval(() => {
        setRefreshTimer(refreshTimer + 1);
      }, widget?.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
    return undefined;
  }, [refreshTimer, widget?.refreshInterval]);

  const scrollingDisableStyle = widget.scrolling
    ? "pointer-events:none; overflow: hidden;"
    : "";

  const sizeClasses = `h-${widget?.sizes?.xs || 80} sm:h-${
    widget?.sizes?.sm || 80
  } md:h-${widget?.sizes?.md || 80} lg:h-${widget?.sizes?.lg || 80} xl:h-${
    widget?.sizes?.xl || 80
  } 2xl:h-${widget?.sizes?.["2xl"] || 80}`;

  return (
    <Container service={service}>
      <Block>
        <iframe
          src={widget?.src}
          key={`${widget?.name}-${refreshTimer}`}
          name={widget?.name}
          title={widget?.name}
          allow={widget?.allowPolicy}
          allowFullScreen={widget?.allowfullscreen}
          referrerPolicy={widget?.referrerPolicy}
          loading={widget?.loadingStrategy}
          scrolling={widget?.allowScrolling}
          frameBorder={widget?.border}
          style={{ width: "100%", scrollingDisableStyle }}
          className={sizeClasses}
        />
      </Block>
    </Container>
  );
}
