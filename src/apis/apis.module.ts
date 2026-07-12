import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TodoModule } from "./todo/todo.module";

/**
 * Single registry of every feature module.
 * Nothing is auto-discovered — when you add a new module, register it here.
 */
@Module({
  imports: [AuthModule, TodoModule],
})
export class ApisModule {}
