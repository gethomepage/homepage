import { useTranslation } from "next-i18next";

import { PendingRequest, RequestContainer } from "./pendingRequest";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import { formatProxyUrlWithSegments } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: statsData, error: statsError, mutate: statsMutate } = useWidgetAPI(widget, "request/count");
  const { data: settingsData, error: settingsError } = useWidgetAPI(widget, "mainSettings");
  const {
    data: pendingRequestsData,
    error: pendingRequestsError,
    mutate: pendingRequestsMutate,
  } = useWidgetAPI(widget, "pendingRequests");

  if (statsError || pendingRequestsError || settingsError) {
    const finalError = statsError ?? pendingRequestsError ?? settingsError;
    return <Container service={service} error={finalError} />;
  }

  async function handleUpdateRequestStatus(requestId, status) {
    const url = formatProxyUrlWithSegments(widget, "updateRequestStatus", {
      id: requestId,
      status,
    });
    await fetch(url).then(() => {
      statsMutate();
      pendingRequestsMutate();
    });
  }

  const pendingRequests = widget.pendingRequests ? pendingRequestsData?.results ?? [] : [];

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="overseerr.pending" />
        <Block label="overseerr.processing" />
        <Block label="overseerr.approved" />
        <Block label="overseerr.available" />
      </Container>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="overseerr.pending" value={t("common.number", { value: statsData.pending })} />
        <Block label="overseerr.processing" value={t("common.number", { value: statsData.processing })} />
        <Block label="overseerr.approved" value={t("common.number", { value: statsData.approved })} />
        <Block label="overseerr.available" value={t("common.number", { value: statsData.available })} />
      </Container>
      <RequestContainer>
        {pendingRequests.map((request) => (
          <PendingRequest
            key={request.id}
            request={request}
            widget={widget}
            applicationUrl={settingsData?.applicationUrl}
            onApprove={() => handleUpdateRequestStatus(request.id, "approve")}
            onDecline={() => handleUpdateRequestStatus(request.id, "decline")}
          />
        ))}
      </RequestContainer>
    </>
  );
}
