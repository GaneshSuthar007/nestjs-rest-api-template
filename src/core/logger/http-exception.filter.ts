import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { logger } from "./logger";

/**
 * Global exception filter — every error, expected or not, leaves the API
 * in one consistent shape:
 *
 *   { "status": 400, "message": "...", "timestamp": "...", "path": "/v1/..." }
 *
 * Unknown (non-HttpException) errors are logged with their stack and
 * returned as a generic 500 so internals never leak to clients.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = "Internal server error";
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const raw = (res as Record<string, unknown>).message;
        message = Array.isArray(raw) ? raw.join(", ") : ((raw as string) ?? exception.message);
      }
    } else if (exception instanceof Error) {
      logger.error(`Unhandled exception: ${exception.stack ?? exception.message}`);
    }

    logger.warn(`${request.method} ${request.originalUrl} -> ${status} | ${message}`);

    response.status(status).json({
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
