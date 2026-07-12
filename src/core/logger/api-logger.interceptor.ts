import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable, tap } from "rxjs";
import { logger } from "./logger";

/**
 * Registered globally (APP_INTERCEPTOR in app.module.ts).
 * Logs every successful request with its duration — the failure path is
 * logged by HttpExceptionFilter, so nothing is logged twice.
 */
@Injectable()
export class ApiLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startedAt = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          logger.info(`${request.method} ${request.originalUrl} | ${Date.now() - startedAt}ms`),
        ),
      );
  }
}
