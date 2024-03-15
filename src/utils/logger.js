/* eslint-disable no-console */
import { format as utilFormat } from "node:util";

import winston from "winston";

import checkAndCopyConfig, { CONF_DIR, getSettings } from "utils/config/config";

let winstonLogger;

function combineMessageAndSplat() {
  return {
    // eslint-disable-next-line no-unused-vars
    transform: (info, opts) => {
      // combine message and args if any
      // eslint-disable-next-line no-param-reassign
      info.message = utilFormat(info.message, ...(info[Symbol.for("splat")] || []));
      return info;
    },
  };
}

function messageFormatter(logInfo) {
  if (logInfo.label) {
    if (logInfo.stack) {
      return `[${logInfo.timestamp}] ${logInfo.level}: <${logInfo.label}> ${logInfo.stack}`;
    }
    return `[${logInfo.timestamp}] ${logInfo.level}: <${logInfo.label}> ${logInfo.message}`;
  }

  if (logInfo.stack) {
    return `[${logInfo.timestamp}] ${logInfo.level}: ${logInfo.stack}`;
  }
  return `[${logInfo.timestamp}] ${logInfo.level}: ${logInfo.message}`;
}

function getConsoleLogger() {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      combineMessageAndSplat(),
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(messageFormatter),
    ),
    handleExceptions: true,
    handleRejections: true,
  });
}

function getFileLogger() {
  const settings = getSettings();
  const logpath = settings.logpath || CONF_DIR;

  return new winston.transports.File({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      combineMessageAndSplat(),
      winston.format.timestamp(),
      winston.format.printf(messageFormatter),
    ),
    filename: `${logpath}/logs/homepage.log`,
    handleExceptions: true,
    handleRejections: true,
  });
}

function init() {
  checkAndCopyConfig("settings.yaml");
  const configuredTargets = process.env.LOG_TARGETS || "both";
  const loggingTransports = [];

  switch (configuredTargets) {
    case "both":
      loggingTransports.push(getConsoleLogger(), getFileLogger());
      break;
    case "stdout":
      loggingTransports.push(getConsoleLogger());
      break;
    case "file":
      loggingTransports.push(getFileLogger());
      break;
    default:
      loggingTransports.push(getConsoleLogger(), getFileLogger());
  }

  winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports: loggingTransports,
  });

  // patch the console log mechanism to use our logger
  const consoleMethods = ["log", "debug", "info", "warn", "error"];
  consoleMethods.forEach((method) => {
    // workaround for https://github.com/winstonjs/winston/issues/1591
    switch (method) {
      case "log":
        console[method] = winstonLogger.info.bind(winstonLogger);
        break;
      default:
        console[method] = winstonLogger[method].bind(winstonLogger);
        break;
    }
  });
}

const loggers = {};

export default function createLogger(label) {
  if (!winstonLogger) {
    init();
  }

  if (!loggers[label]) {
    loggers[label] = winstonLogger.child({ label });
  }

  return loggers[label];
}
