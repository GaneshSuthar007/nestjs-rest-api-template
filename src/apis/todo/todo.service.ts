import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../core/database/prisma.service";
import { PaginationService } from "../../core/database/pagination.service";
import { messages } from "../../common/messages";
import { CreateTodoDTO, ListTodosDTO, UpdateTodoDTO } from "./dto/todo.dto";

/**
 * Service rules:
 *   - every method wraps its body in try/catch; HttpExceptions are
 *     re-thrown as-is, anything unexpected becomes a BadRequestException
 *   - list endpoints filter and paginate at the DATABASE level
 *   - after a mutation, return fresh data (the updated row), never the
 *     raw write payload
 *   - ownership checks live in the WHERE clause, not in application code
 */
@Injectable()
export class TodoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createTodo(user: User, createTodoDTO: CreateTodoDTO) {
    try {
      return await this.prisma.todo.create({
        data: { ...createTodoDTO, userId: user.id },
      });
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }

  async getTodos(user: User, query: ListTodosDTO) {
    try {
      const where: Prisma.TodoWhereInput = {
        userId: user.id,
        ...(query.status && { status: query.status }),
      };

      return await this.pagination.paginate(
        this.prisma.todo,
        { where, orderBy: { createdAt: "desc" } },
        query,
      );
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }

  async getTodoById(user: User, id: number) {
    try {
      const todo = await this.prisma.todo.findFirst({
        where: { id, userId: user.id },
      });
      if (!todo) {
        throw new NotFoundException(messages.todo.notFound);
      }
      return todo;
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }

  async updateTodo(user: User, id: number, updateTodoDTO: UpdateTodoDTO) {
    try {
      const { count } = await this.prisma.todo.updateMany({
        where: { id, userId: user.id },
        data: updateTodoDTO,
      });
      if (count === 0) {
        throw new NotFoundException(messages.todo.notFound);
      }
      return await this.prisma.todo.findUnique({ where: { id } });
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }

  async deleteTodo(user: User, id: number) {
    try {
      const { count } = await this.prisma.todo.deleteMany({
        where: { id, userId: user.id },
      });
      if (count === 0) {
        throw new NotFoundException(messages.todo.notFound);
      }
      return { id };
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }
}
