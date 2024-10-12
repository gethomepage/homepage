import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats", {
    query:
      "{ connectors { totalCount states: edges { node { state } } } groups { totalCount states: edges { node { state: isActive } } } users { totalCount states: edges { node { state } } } remoteNetworks { totalCount states: edges { node { state: isActive } } } devices { totalCount states: edges { node { state: activeState } } } resources { totalCount states: edges { node { state: isActive } } } }",
  });

  console.log(statsData);

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  const { connectors, groups, users, remoteNetworks, devices, resources } = statsData || {};

  const activeConnectors = connectors?.states?.filter(({ node }) => node.state === "ALIVE").length;
  const activeGroups = groups?.states?.filter(({ node }) => node.state).length;
  const activeUsers = users?.states?.filter(({ node }) => node.state === "ACTIVE").length;
  const activeNetworks = remoteNetworks?.states?.filter(({ node }) => node.state).length;
  const activeDevices = devices?.states?.filter(({ node }) => node.state === "ACTIVE").length;
  const activeResources = resources?.states?.filter(({ node }) => node.state).length;

  // Provide a default if not set in the config
  if (!widget.fields) {
    widget.fields = ["networks", "connectors", "resources"];
  }

  // Limit to a maximum of 4 at a time
  if (widget.fields.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="twingate.networks" />
        <Block label="twingate.connectors" />
        <Block label="twingate.resources" />
        <Block label="twingate.devices" />
        <Block label="twingate.users" />
        <Block label="twingate.groups" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="twingate.networks" value={`${activeNetworks}/${remoteNetworks?.totalCount}`} />
      <Block label="twingate.connectors" value={`${activeConnectors}/${connectors?.totalCount}`} />
      <Block label="twingate.resources" value={`${activeResources}/${resources?.totalCount}`} />
      <Block label="twingate.devices" value={`${activeDevices}/${devices?.totalCount}`} />
      <Block label="twingate.users" value={`${activeUsers}/${users?.totalCount}`} />
      <Block label="twingate.groups" value={`${activeGroups}/${groups?.totalCount}`} />
    </Container>
  );
}
