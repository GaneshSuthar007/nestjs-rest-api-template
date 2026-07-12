import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AppConfigModule } from "./core/config/config.module";
import { ApiLoggerInterceptor } from "./core/logger/api-logger.interceptor";
import { ApisModule } from "./apis/apis.module";

@Module({
  imports: [
    AppConfigModule, // global, Joi-validated environment config
    ApisModule, // all feature modules
  ],
  providers: [
    // Logs every request (method, path, status, duration)
    { provide: APP_INTERCEPTOR, useClass: ApiLoggerInterceptor },
  ],
})
export class AppModule {}
