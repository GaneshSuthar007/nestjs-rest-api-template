import { Injectable } from "@nestjs/common";
import { PaginatedResult, PaginationQuery } from "../../common/types/pagination.types";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../common/constants";

/**
 * Generic, model-agnostic pagination over any Prisma model delegate.
 *
 * Filtering and pagination happen at the database level (skip/take + count),
 * never by over-fetching rows into application code.
 *
 * Usage:
 *   this.pagination.paginate(
 *     this.prisma.todo,
 *     { where: { userId }, orderBy: { createdAt: "desc" } },
 *     query,
 *   );
 */
interface PrismaModelDelegate<T> {
  findMany(args: any): Promise<T[]>;
  count(args: any): Promise<number>;
}

@Injectable()
export class PaginationService {
  async paginate<T>(
    model: PrismaModelDelegate<T>,
    args: { where?: any; orderBy?: any; select?: any; include?: any },
    query: PaginationQuery,
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE));

    const [items, totalItems] = await Promise.all([
      model.findMany({ ...args, skip: (page - 1) * limit, take: limit }),
      model.count({ where: args.where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
