import { NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiKeyGuard } from "./core/auth/guards/api-key.guard";
import { HttpExceptionFilter } from "./core/logger/http-exception.filter";
import { logger } from "./core/logger/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS — tighten `origin` for production
  app.enableCors({ origin: true });

  // URI versioning: every route is served under /v1/...
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  // Every request must carry a valid `x-api-key` header
  app.useGlobalGuards(new ApiKeyGuard(config));

  // All errors leave the API in one consistent shape
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = config.get<number>("APP_PORT") ?? 3000;
  await app.listen(port);
  logger.info(`API running on http://localhost:${port}/v1`);
}

void bootstrap();
