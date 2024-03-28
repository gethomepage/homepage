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
        widget?.refreshInterval < 1000 ? 1000 : widget?.refreshInterval,
      );
    }
  }, [refreshTimer, widget?.refreshInterval]);

  const scrollingDisableStyle = widget?.allowScrolling === "no" ? { pointerEvents: "none", overflow: "hidden" } : {};

  const classes = widget?.classes || "h-60 sm:h-60 md:h-60 lg:h-60 xl:h-60 2xl:h-72";

  return (
    <Container service={service}>
      <div
        className={classNames(
          "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center text-center",
          "service-block",
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
          style={{
            scrollingDisableStyle,
          }}
          className={`rounded w-full ${classes}`}
        />
      </div>
    </Container>
  );
}
