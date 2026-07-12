import getServiceWidget from "utils/config/service-helpers";
import { asJson, formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

function parseDate(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{8}T\d{6}Z$/.test(value)) {
    const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
    return new Date(iso);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoString(value) {
  const date = parseDate(value);
  return date ? date.toISOString() : null;
}

function getLatestNotificationByBackupId(notifications) {
  const latest = new Map();

  notifications.forEach((notification) => {
    if (!notification?.BackupID) return;
    const previous = latest.get(notification.BackupID);
    const notificationTime = parseDate(notification.Timestamp);
    const previousTime = parseDate(previous?.Timestamp);

    if (
      !previous ||
      (notificationTime && previousTime && notificationTime > previousTime) ||
      (notificationTime && !previousTime)
    ) {
      latest.set(notification.BackupID, notification);
    }
  });

  return latest;
}

function computeBackupStatus(backup, notificationByBackupId, activeBackupId) {
  const backupId = backup?.Backup?.ID;
  const lastFinished = parseDate(backup?.Backup?.Metadata?.LastBackupFinished);
  const lastErrorDate = parseDate(backup?.Backup?.Metadata?.LastErrorDate);
  const notification = notificationByBackupId.get(backupId);
  const notificationTime = parseDate(notification?.Timestamp);

  if (activeBackupId && backupId === activeBackupId) return "running";

  if (lastErrorDate && (!lastFinished || lastErrorDate > lastFinished)) {
    return "error";
  }

  if (notification && notificationTime && (!lastFinished || notificationTime > lastFinished)) {
    if (notification.Type === "Error") return "error";
    if (notification.Type === "Warning") return "warning";
  }

  if (lastFinished) return "ok";

  return "idle";
}

function buildSummary(backups, notifications, serverstate, progressstate) {
  const notificationByBackupId = getLatestNotificationByBackupId(notifications);
  const activeBackupId = serverstate?.ActiveTask ? progressstate?.BackupID : null;
  const summary = {
    jobs: backups.length,
    stored: 0,
    lastBackup: null,
    nextRun: null,
    running: 0,
    warnings: 0,
    errors: 0,
  };
  let latestBackupTime = null;
  let nextRunTime = null;

  backups.forEach((backup) => {
    const metadata = backup?.Backup?.Metadata ?? {};
    const status = computeBackupStatus(backup, notificationByBackupId, activeBackupId);
    const lastBackup = parseDate(metadata?.LastBackupFinished);
    const nextRun = parseDate(backup?.Schedule?.Time);

    summary.stored += Number(metadata?.TargetFilesSize) || 0;

    if (lastBackup && (!latestBackupTime || lastBackup > latestBackupTime)) {
      latestBackupTime = lastBackup;
    }

    if (nextRun && (!nextRunTime || nextRun < nextRunTime)) {
      nextRunTime = nextRun;
    }

    if (status === "running") summary.running += 1;
    if (status === "warning") summary.warnings += 1;
    if (status === "error") summary.errors += 1;
  });

  return {
    ...summary,
    lastBackup: toIsoString(latestBackupTime),
    nextRun: toIsoString(nextRunTime),
  };
}

async function login(widget) {
  const loginUrl = new URL(formatApiCall(widgets[widget.type].api, { endpoint: "auth/login", ...widget }));
  const [status, , data] = await httpProxy(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Password: String(widget.password),
      RememberMe: true,
    }),
  });

  if (status !== 200) {
    throw new Error(`Unable to login to Duplicati (status ${status})`);
  }

  const body = asJson(data);
  if (!body?.AccessToken) {
    throw new Error("Duplicati login response did not include an access token");
  }

  return body.AccessToken;
}

async function apiGet(widget, endpoint, accessToken) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const [status, , data] = await httpProxy(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (status !== 200) {
    throw new Error(`Duplicati request failed for ${endpoint}`);
  }

  return asJson(data);
}

export default async function duplicatiProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!widget.url || !widget.password) {
    return res.status(500).json({
      error: {
        message: `Duplicati widget is missing required url and password`,
      },
    });
  }

  try {
    const accessToken = await login(widget);
    const [backups, serverstate, notifications, progressstate] = await Promise.all([
      apiGet(widget, "backups", accessToken),
      apiGet(widget, "serverstate", accessToken),
      apiGet(widget, "notifications", accessToken),
      apiGet(widget, "progressstate", accessToken),
    ]);

    const summary = buildSummary(
      Array.isArray(backups) ? backups : [],
      Array.isArray(notifications) ? notifications : [],
      serverstate ?? {},
      progressstate ?? {},
    );

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({
      error: {
        message: "Error communicating with Duplicati",
        rawError: error,
      },
    });
  }
}

export { buildSummary, computeBackupStatus, getLatestNotificationByBackupId, login };
