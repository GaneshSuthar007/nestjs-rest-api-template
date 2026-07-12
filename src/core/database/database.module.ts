import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { PaginationService } from "./pagination.service";

/**
 * Imported explicitly by every feature module that touches the database.
 * Keeping the import explicit (rather than @Global) makes each module's
 * dependencies visible at a glance.
 */
@Module({
  providers: [PrismaService, PaginationService],
  exports: [PrismaService, PaginationService],
})
export class DatabaseModule {}
