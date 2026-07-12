import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";

/**
 * Global configuration module.
 *
 * Every environment variable the app depends on is validated with Joi at
 * boot time — the app refuses to start with a clear error message instead
 * of failing mysteriously at runtime.
 *
 * `allowUnknown: true` lets you keep extra variables in .env without
 * breaking validation.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        APP_PORT: Joi.number().port().default(3000),
        API_KEY: Joi.string().min(16).required(),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default("7d"),
        DATABASE_URL: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class AppConfigModule {}
