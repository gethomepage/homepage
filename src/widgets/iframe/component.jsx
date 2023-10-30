import { useState, useEffect } from "react";
import classNames from "classnames";

import Container from "components/services/widget/container";

export default function Component({ service }) {
  const [refreshTimer, setRefreshTimer] = useState(0);

  const { widget } = service;

  useEffect(() => {
    if (widget?.refreshInterval) {
      setInterval(
        () => setRefreshTimer(refreshTimer + 1),
        widget?.refreshInterval < 1000 ? 1000 : widget?.refreshInterval
      );
    }
  }, [refreshTimer, widget?.refreshInterval]);

  const scrollingDisableStyle =
    widget?.allowScrolling === "no"
      ? { pointerEvents: "none", overflow: "hidden" }
      : {};

  const sizeClasses = `h-${widget?.sizes?.xs || 80} sm:h-${
    widget?.sizes?.sm || 80
  } md:h-${widget?.sizes?.md || 80} lg:h-${widget?.sizes?.lg || 80} xl:h-${
    widget?.sizes?.xl || 80
  } 2xl:h-${widget?.sizes?.["2xl"] || 80}`;

  return (
    <Container service={service}>
      <div
        className={classNames(
          "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center text-center",
          "service-block"
        )}
      >
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
          style={{
            width: "100%",
            "border-radius": "4px",
            scrollingDisableStyle,
          }}
          className={sizeClasses}
        />
      </div>
    </Container>
  );
}
