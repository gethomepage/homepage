import { join } from "path";

import winston from "winston";

const configPath = join(process.cwd(), "config");

function messageFormatter(logInfo) {
  if (logInfo.stack) {
    return `[${logInfo.timestamp}] ${logInfo.level}: ${logInfo.stack}`;
  }
  return `[${logInfo.timestamp}] ${logInfo.level}: ${logInfo.message}`;
};

const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(messageFormatter)
);

const fileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.timestamp(),
  winston.format.printf(messageFormatter)
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    }),

    new winston.transports.File({
      format: fileFormat,
      filename: `${configPath}/logs/homepage.log`,
      handleExceptions: true,
      handleRejections: true
    }),
  ]
});

function debug(message, ...args) {
  logger.debug(message, ...args);
}

function verbose(message, ...args) {
  logger.verbose(message, ...args);
}

function info(message, ...args) {
  logger.info(message, ...args);
}

function warn(message, ...args) {
  logger.warn(message, ...args);
}

function error(message, ...args) {
  logger.error(message, ...args);
}

function crit(message, ...args) {
  logger.crit(message, ...args);
}

const thisModule = {
  debug,
  verbose,
  info,
  warn,
  error,
  crit
};

export default thisModule;