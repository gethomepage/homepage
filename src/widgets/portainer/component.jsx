import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  // Conditionally call Kubernetes APIs only when widget.kubernetes is true
  const { data: applicationsData, error: applicationsError } = useWidgetAPI(
    widget,
    "kubernetes/applications",
    { disabled: !widget.kubernetes }
  );

  const { data: servicesData, error: servicesError } = useWidgetAPI(
    widget,
    "kubernetes/services",
    { disabled: !widget.kubernetes }
  );

  const { data: namespacesData, error: namespacesError } = useWidgetAPI(
    widget,
    "kubernetes/namespaces",
    { disabled: !widget.kubernetes }
  );

  // Conditionally call Docker API only when widget.kubernetes is false
  const { data: containersData, error: containersError } = useWidgetAPI(
    widget,
    "docker/containers",
    {
      all: 1,
      disabled: !!widget.kubernetes
    }
  );

  // Kubernetes widget handling
  if (!!widget.kubernetes) {
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
