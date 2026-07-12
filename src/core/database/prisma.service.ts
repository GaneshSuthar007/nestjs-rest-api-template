import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Single shared Prisma client for the whole application.
 *
 * Inject it into any service:
 *   constructor(private readonly prisma: PrismaService) {}
 *   this.prisma.user.findMany(...)
 *
 * Tip: if you need computed fields on read (e.g. prepending a CDN base URL
 * to image paths), use Prisma client extensions ($extends) here so every
 * consumer gets the transformation for free.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
