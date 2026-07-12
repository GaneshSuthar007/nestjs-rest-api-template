import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { JwtGuard } from "../../core/auth/guards/jwt.guard";
import { JoiValidationPipe } from "../../core/pipes/joi-validation.pipe";
import { ResponseUtil } from "../../core/utils/response.util";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { Response } from "../../common/types/response.types";
import { messages } from "../../common/messages";
import { TodoService } from "./todo.service";
import {
  CreateTodoDTO,
  CreateTodoSchema,
  ListTodosDTO,
  ListTodosSchema,
  UpdateTodoDTO,
  UpdateTodoSchema,
} from "./dto/todo.dto";

/**
 * Controller rules:
 *   - class-level @UseGuards(JwtGuard) when ALL endpoints need auth
 *   - return type is always Promise<Response>
 *   - ResponseUtil.ok() for reads, .created() for writes
 *   - messages always come from src/common/messages.ts
 *   - validation pipes are applied per handler, never class-level
 */
@Controller("todos")
@UseGuards(JwtGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(CreateTodoSchema))
  async createTodo(
    @GetUser() user: User,
    @Body() createTodoDTO: CreateTodoDTO,
  ): Promise<Response> {
    const result = await this.todoService.createTodo(user, createTodoDTO);
    return ResponseUtil.created(result, messages.todo.createdSuccessfully);
  }

  @Get()
  async getTodos(
    @GetUser() user: User,
    @Query(new JoiValidationPipe(ListTodosSchema)) query: ListTodosDTO,
  ): Promise<Response> {
    const result = await this.todoService.getTodos(user, query);
    return ResponseUtil.ok(result, messages.todo.fetchedSuccessfully);
  }

  @Get(":id")
  async getTodoById(
    @GetUser() user: User,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Response> {
    const result = await this.todoService.getTodoById(user, id);
    return ResponseUtil.ok(result, messages.todo.fetchedOneSuccessfully);
  }

  @Patch(":id")
  async updateTodo(
    @GetUser() user: User,
    @Param("id", ParseIntPipe) id: number,
    @Body(new JoiValidationPipe(UpdateTodoSchema)) updateTodoDTO: UpdateTodoDTO,
  ): Promise<Response> {
    const result = await this.todoService.updateTodo(user, id, updateTodoDTO);
    return ResponseUtil.ok(result, messages.todo.updatedSuccessfully);
  }

  @Delete(":id")
  async deleteTodo(
    @GetUser() user: User,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Response> {
    const result = await this.todoService.deleteTodo(user, id);
    return ResponseUtil.ok(result, messages.todo.deletedSuccessfully);
  }
}
