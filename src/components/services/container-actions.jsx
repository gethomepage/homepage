import { useState } from "react";
import useSWR, { mutate } from "swr";

import Dropdown from "./dropdown";

export default function ContainerActions({ containerName, server, service }) {
  const statusUrl = `/api/docker/status/${containerName}/${server || ""}`;
  const { data, error } = useSWR(statusUrl);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleContainerAction = async (action) => {
    try {
      console.log("Attempting to", action, "container:", containerName, "on server:", server);
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
      // Reset selected action after successful operation
      setSelectedAction(null);
      // Refresh the container status in both components
      await mutate(statusUrl);
      // If we have the service object, we can also trigger refresh in the status component
      if (service) {
        const serviceStatusUrl = `/api/docker/status/${service.container}/${service.server || ""}`;
        await mutate(serviceStatusUrl);
      }
    } catch (error) {
      console.error(`Error ${action}ing container:`, error);
    }
  };

  // Only show dropdown if container status is running, exited, or unknown
  if (!data || error || (data.status !== "running" && data.status !== "exited" && data.status !== "unknown")) {
    return null;
  }

  const options =
    data.status === "running"
      ? [
          { value: "stop", label: "Stop" },
          { value: "restart", label: "Restart" },
        ]
      : [{ value: "start", label: "Start" }];
  // For unknown status, treat it like a stopped container

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
