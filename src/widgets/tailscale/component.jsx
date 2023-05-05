import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "device", {
    refreshInterval: 1000 * 60
  });

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="tailscale.address" />
        <Block label="tailscale.last_seen" />
        <Block label="tailscale.expires" />
      </Container>
    );
  }

  const address = statsData.addresses[0]

  const now = new Date()
  const compareDifferenceInTwoDates = (priorDate, futureDate) => {
    const diff = futureDate.getTime() - priorDate.getTime()
    const diffInYears = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))
    if (diffInYears > 1) return `${diffInYears}y`
    const diffInWeeks = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7))
    if (diffInWeeks > 1) return `${diffInWeeks}w`
    const diffInDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (diffInDays > 1) return `${diffInDays}d`
    const diffInHours = Math.ceil(diff / (1000 * 60 * 60))
    if (diffInHours > 1) return `${diffInHours}h`
    const diffInMinutes = Math.ceil(diff / (1000 * 60))
    if (diffInMinutes > 1) return `${diffInMinutes}m`
    const diffInSeconds = Math.ceil(diff / 1000)
    if (diffInSeconds > 10) return `${diffInSeconds}s`
    return 'Now'
  }

  const getLastSeen = () => {
    const lastSeen = new Date(statsData.lastSeen)
    const diff = compareDifferenceInTwoDates(lastSeen, now)
    return `${diff === 'Now' ? diff : `${diff} Ago`}`
  }

  const getExpiry = () => {
    if (statsData.keyExpiryDisabled) return 'Never'
    const expiry = new Date(statsData.expires)
    return compareDifferenceInTwoDates(now, expiry)
  }

  return (
    <Container service={service}>
      <Block label="tailscale.address" value={address} />
      <Block label="tailscale.last_seen" value={getLastSeen()} />
      <Block label="tailscale.expires" value={getExpiry()} />
    </Container>
  );
}
