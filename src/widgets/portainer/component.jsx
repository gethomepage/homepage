import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = widget.kubernetes ? ["applications", "services", "namespaces"] : ["running", "stopped", "total"];
  }

  const { data: dockerDashboard, error: dockerError } = useWidgetAPI(
    widget,
    widget.kubernetes ? "" : "docker/dashboard",
  );

  const { data: applicationsCount, error: applicationsError } = useWidgetAPI(
    widget,
    widget.kubernetes ? "kubernetes/applications" : "",
  );

  const { data: servicesCount, error: servicesError } = useWidgetAPI(
    widget,
    widget.kubernetes ? "kubernetes/services" : "",
  );

  const { data: namespacesCount, error: namespacesError } = useWidgetAPI(
    widget,
    widget.kubernetes ? "kubernetes/namespaces" : "",
  );

  if (widget.kubernetes) {
    const error = applicationsError ?? servicesError ?? namespacesError;
    // count can be an error object
    if (error || typeof applicationsCount === "object") {
      return <Container service={service} error={error ?? applicationsCount} />;
    }

    if (applicationsCount == undefined || servicesCount == undefined || namespacesCount == undefined) {
      return (
        <Container service={service}>
          <Block label="portainer.applications" />
          <Block label="portainer.services" />
          <Block label="portainer.namespaces" />
        </Container>
      );
    }

    return (
      <Container service={service}>
        <Block label="portainer.applications" value={applicationsCount ?? 0} />
        <Block label="portainer.services" value={servicesCount ?? 0} />
        <Block label="portainer.namespaces" value={namespacesCount ?? 0} />
      </Container>
    );
  }

  if (dockerError) {
    return <Container service={service} error={dockerError} />;
  }

  if (!dockerDashboard) {
    return (
      <Container service={service}>
        <Block label="portainer.running" />
        <Block label="portainer.stopped" />
        <Block label="portainer.total" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="portainer.running" value={dockerDashboard.containers.running} />
      <Block label="portainer.stopped" value={dockerDashboard.containers.stopped} />
      <Block label="portainer.total" value={dockerDashboard.containers.total} />
    </Container>
  );
}
