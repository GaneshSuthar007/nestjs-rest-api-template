import * as winston from "winston";

/**
 * Application-wide Winston logger.
 *
 * Console transport by default. For production, add file rotation:
 *   npm i winston-daily-rotate-file
 * and push a DailyRotateFile transport here.
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`,
    ),
  ),
  transports: [new winston.transports.Console()],
});
