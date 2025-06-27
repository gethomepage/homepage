import { useState } from "react";
import useSWR, { mutate } from "swr";

import Dropdown from "./dropdown";

export default function ContainerActions({ containerName, server, service }) {
  const statusUrl = `/api/docker/status/${containerName}/${server || ""}`;
  const { data, error } = useSWR(statusUrl);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleContainerAction = async (action) => {
    try {
      const response = await fetch(`/api/docker/container/${action}/${containerName}/${server || ""}`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = `Failed to ${action} container: ${
          errorData?.message || response.statusText || "Unknown error"
        }`;
        console.error("Full response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          containerName,
          server,
        });
        throw new Error(errorMessage);
      }
      setSelectedAction(null);
      await mutate(statusUrl);
      if (service) {
        const serviceStatusUrl = `/api/docker/status/${service.container}/${service.server || ""}`;
        await mutate(serviceStatusUrl);
      }
    } catch (error) {
      console.error(`Error ${action}ing container:`, error);
    }
  };

  if (!data || error) {
    return null;
  }

  const options =
    data.status === "running"
      ? [
          { value: "stop", label: "Stop" },
          { value: "restart", label: "Restart" },
        ]
      : [{ value: "start", label: "Start" }];

  return (
    <div className="relative" style={{ position: "relative" }}>
      <Dropdown
        options={options}
        value={selectedAction}
        setValue={(value) => {
          setSelectedAction(value);
          handleContainerAction(value);
        }}
      />
    </div>
  );
}
