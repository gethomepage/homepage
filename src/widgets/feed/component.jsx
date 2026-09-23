/* eslint-disable @next/next/no-img-element */
import classNames from "classnames";
import { useTranslation } from "next-i18next/pages";
import { useContext } from "react";

import Container from "components/services/widget/container";
import { SettingsContext } from "utils/contexts/settings";
import useWidgetAPI from "utils/proxy/use-widget-api";

const rowClassName = "rounded-md bg-theme-200/50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-200 text-xs";
const hideBrokenImage = (e) => {
  e.currentTarget.style.visibility = "hidden";
};

function FeedLink({ item, target, className, children }) {
  if (!item.link) return <div className={className}>{children}</div>;
  return (
    <a
      href={item.link}
      target={target}
      rel="noopener noreferrer"
      className={classNames(className, "hover:bg-theme-300/50 dark:hover:bg-theme-800/20")}
    >
      {children}
    </a>
  );
}

function RelativeDate({ date }) {
  const { t } = useTranslation();
  if (!date) return null;
  return (
    <span className="shrink-0 text-theme-500 dark:text-theme-400">
      {t("common.relativeDate", { value: date, formatParams: { value: { style: "narrow", numeric: "auto" } } })}
    </span>
  );
}

function ListItem({ item, target }) {
  return (
    <FeedLink
      item={item}
      target={target}
      className={classNames(rowClassName, "flex items-center gap-2 px-2", item.image ? "py-1" : "h-5")}
    >
      {item.image && (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={hideBrokenImage}
          className="w-12 h-8 shrink-0 rounded-sm object-cover"
        />
      )}
      <span className="grow truncate text-left">{item.title}</span>
      <RelativeDate date={item.date} />
    </FeedLink>
  );
}

function GridItem({ item, target }) {
  return (
    <FeedLink item={item} target={target} className={classNames(rowClassName, "flex flex-col overflow-hidden")}>
      <div className="relative aspect-video w-full overflow-hidden bg-theme-200/50 dark:bg-theme-900/30">
        {item.image && (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={hideBrokenImage}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1.5 py-1 text-left">
        <span className="line-clamp-2">{item.title}</span>
        <RelativeDate date={item.date} />
      </div>
    </FeedLink>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, undefined, undefined, { refreshInterval: 10 * 60 * 1000 });

  if (error) {
    return <Container service={service} error={error} />;
  }

  const target = service.target ?? settings?.target ?? "_blank";
  const isGrid = widget.layout === "grid";
  const Item = isGrid ? GridItem : ListItem;

  let content;
  if (!data) {
    content = [0, 1, 2].map((i) => (
      <div key={i} className={classNames(rowClassName, "animate-pulse", isGrid ? "aspect-video" : "h-5")} />
    ));
  } else if (!data.items?.length) {
    content = <div className={classNames(rowClassName, "h-5 px-2 flex items-center")}>{t("feed.noItems")}</div>;
  } else {
    content = data.items.map((item, i) => <Item key={`${item.link ?? item.title}-${i}`} item={item} target={target} />);
  }

  return (
    <Container service={service}>
      <div
        className={classNames(
          "w-full p-1 gap-1",
          isGrid ? "grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]" : "flex flex-col",
        )}
      >
        {content}
      </div>
    </Container>
  );
}
