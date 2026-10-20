import { useTranslation } from "next-i18next/pages";
import { useContext } from "react";
import { MdOutlinePrint, MdOutlineVisibility, MdStar } from "react-icons/md";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { SettingsContext } from "utils/contexts/settings";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const THINGPORT_DEFAULT_FIELDS = ["models", "collections", "categories", "authors"];

// The summary already carries the first three models of each dashboard list, so longer lists cost one more call.
const MODEL_LISTS = {
  recent: "recently_added",
  viewed: "top_viewed",
  printed: "top_printed",
};
const SUMMARY_MODELS = 3;
const MAX_MODELS = 10;

const rowClassName =
  "text-theme-700 dark:text-theme-200 relative h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 px-1 flex hover:bg-theme-300/50 dark:hover:bg-theme-800/20";

// Thingport picks the featured model per day, so ask for the viewer's local day, as Thingport's own dashboard does.
function localDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function ModelRow({ href, target, icon, name, detail }) {
  return (
    <a href={href} target={target} rel="noopener noreferrer" className={rowClassName}>
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full h-4 whitespace-nowrap text-ellipsis overflow-hidden text-left" title={name}>
          {icon}
          {name}
        </div>
      </div>
      <div className="self-center text-xs flex items-center justify-end mr-1.5 pl-1 z-10 whitespace-nowrap">
        {detail}
      </div>
    </a>
  );
}

function ModelDetail({ list, model }) {
  const { t } = useTranslation();

  if (list === "viewed") {
    return (
      <>
        <MdOutlineVisibility className="opacity-50 mr-1" title={t("thingport.views")} />
        {t("common.number", { value: model.view_count })}
      </>
    );
  }

  if (list === "printed") {
    return (
      <>
        <MdOutlinePrint className="opacity-50 mr-1" title={t("thingport.prints")} />
        {t("common.number", { value: model.print_count })}
      </>
    );
  }

  return t("common.relativeDate", {
    value: model.created_at,
    formatParams: { value: { style: "narrow", numeric: "auto" } },
  });
}

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, THINGPORT_DEFAULT_FIELDS);
  const { widget } = service;
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);

  const modelList = MODEL_LISTS[widget.models] ? widget.models : null;
  const showBlocks = widget.enableBlocks ?? true;
  const maxModels = Math.min(Math.max(widget.maxModels || SUMMARY_MODELS, 1), MAX_MODELS);
  const needsFullList = modelList && maxModels > SUMMARY_MODELS;

  const { data, error } = useWidgetAPI(widget, "summary");
  const { data: listData, error: listError } = useWidgetAPI(
    widget,
    needsFullList ? modelList : "",
    modelList === "recent" ? { orderBy: "newest", limit: maxModels } : undefined,
  );
  const { data: featuredData, error: featuredError } = useWidgetAPI(widget, widget.featured ? "featured" : "", {
    date: localDate(),
  });

  if (error || listError || featuredError) {
    return <Container service={service} error={error ?? listError ?? featuredError} />;
  }

  if (!data && !showBlocks) {
    return null;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="thingport.models" />
        <Block label="thingport.collections" />
        <Block label="thingport.categories" />
        <Block label="thingport.authors" />
      </Container>
    );
  }

  const target = service.target ?? settings?.target ?? "_blank";
  const baseUrl = (service.href ?? widget.url).replace(/\/+$/, "");
  const modelHref = (id) => `${baseUrl}/models/${encodeURIComponent(id)}`;
  const featured = featuredData?.print;
  const featuredBy = featured?.author?.name ?? featured?.author?.handle ?? featured?.category_name;
  // Until the longer list arrives, show the summary's models rather than nothing.
  const models = (needsFullList && Array.isArray(listData) ? listData : data[MODEL_LISTS[modelList]])?.slice(
    0,
    maxModels,
  );

  return (
    <>
      {showBlocks && (
        <Container service={service}>
          <Block label="thingport.models" value={t("common.number", { value: data.model_count })} />
          <Block label="thingport.collections" value={t("common.number", { value: data.collection_count })} />
          <Block label="thingport.categories" value={t("common.number", { value: data.category_count })} />
          <Block label="thingport.authors" value={t("common.number", { value: data.author_count })} />
        </Container>
      )}
      {featured && (
        <ModelRow
          href={modelHref(featured.id)}
          target={target}
          icon={<MdStar className="inline-block mr-1 -mt-0.5 opacity-80" title={t("thingport.featured")} />}
          name={featured.name}
          detail={featuredBy}
        />
      )}
      {modelList &&
        models?.map((model) => (
          <ModelRow
            key={model.id}
            href={modelHref(model.id)}
            target={target}
            name={model.name}
            detail={<ModelDetail list={modelList} model={model} />}
          />
        ))}
    </>
  );
}
