import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { JwtStrategy } from "../../core/auth/strategies/jwt.strategy";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";

/**
 * ⭐ CANONICAL FEATURE MODULE — copy this folder to start a new feature.
 *
 * Every feature module follows the same four-file shape:
 *   todo.module.ts      — imports DatabaseModule, provides Service + JwtStrategy
 *   todo.controller.ts  — thin HTTP layer, ResponseUtil + messages only
 *   todo.service.ts     — business logic, Prisma access, error wrapping
 *   dto/todo.dto.ts     — DTO classes + Joi schemas together
 *
 * Then register the module in src/apis/apis.module.ts.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [TodoController],
  providers: [TodoService, JwtStrategy],
})
export class TodoModule {}
