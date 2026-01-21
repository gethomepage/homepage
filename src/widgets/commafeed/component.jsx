import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
    const { t } = useTranslation();
    const { widget } = service;
    const { data: commafeedData, error: commafeedError } = useWidgetAPI(widget, "counters");

    if (commafeedError) {
        return <Container service={service} error={commafeedError} />;
    }

    if (!commafeedData) {
        return (
            <Container service={service}>
                <Block label="commafeed.unread" />
            </Container>
        );
    }

    return (
        <Container service={service}>
            <Block label="commafeed.unread" value={t("common.number", { value: commafeedData.unread })} />
        </Container>
    );
}
