import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const isKubernetesWidget = !!widget.kubernetes;

  if (!widget.fields) {
    widget.fields = isKubernetesWidget ? ["applications", "services", "namespaces"] : ["running", "stopped", "total"];
  }

  const MAX_ALLOWED_FIELDS = 4;
  if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  const { data: applicationsData, error: applicationsError } = useWidgetAPI(
    widget,
    isKubernetesWidget ? "kubernetes/applications" : "",
  );

  const { data: servicesData, error: servicesError } = useWidgetAPI(
    widget,
    isKubernetesWidget ? "kubernetes/services" : "",
  );

  const { data: namespacesData, error: namespacesError } = useWidgetAPI(
    widget,
    isKubernetesWidget ? "kubernetes/namespaces" : "",
  );

  const { data: containersData, error: containersError } = useWidgetAPI(
    widget,
    isKubernetesWidget ? "" : "docker/containers",
    {
      all: 1,
    },
  );

  // Kubernetes widget handling
  if (isKubernetesWidget) {
    const error = applicationsError || servicesError || namespacesError;
    if (error) {
      return <Container service={service} error={error} />;
    }

    return (
      <Container service={service}>
        <Block label="portainer.applications" value={applicationsData ?? 0} />
        <Block label="portainer.services" value={servicesData ?? 0} />
        <Block label="portainer.namespaces" value={namespacesData ?? 0} />
      </Container>
    );
  }

  // Docker widget handling
  if (containersError) {
    return <Container service={service} error={containersError} />;
  }

  if (!containersData) {
    return (
      <Container service={service}>
        <Block label="portainer.running" />
        <Block label="portainer.stopped" />
        <Block label="portainer.total" />
      </Container>
    );
  }

  if (containersData.error || containersData.message) {
    // containersData can be itself an error object e.g. if environment fails
    return <Container service={service} error={containersData?.error ?? containersData} />;
  }

  const running = containersData.filter((c) => c.State === "running").length;
  const stopped = containersData.filter((c) => c.State === "exited").length;
  const total = containersData.length;

  return (
    <Container service={service}>
      <Block label="portainer.running" value={running} />
      <Block label="portainer.stopped" value={stopped} />
      <Block label="portainer.total" value={total} />
    </Container>
  );
}
