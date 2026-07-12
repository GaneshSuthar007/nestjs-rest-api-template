import * as Joi from "joi";
import { TodoStatus } from "@prisma/client";
import { PaginationQuery } from "../../../common/types/pagination.types";
import { MAX_PAGE_SIZE } from "../../../common/constants";

/**
 * DTO conventions:
 *   - plain classes, no decorators (validation is Joi, NOT class-validator)
 *   - Joi schema lives next to its DTO in the same file
 *   - enums come straight from @prisma/client via Object.values()
 *   - every schema ends with .options({ abortEarly: true, allowUnknown: false })
 */

export class CreateTodoDTO {
  title: string;
  description?: string;
  status?: TodoStatus;
}

export const CreateTodoSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(2000).optional(),
  status: Joi.string()
    .valid(...Object.values(TodoStatus))
    .optional(),
})
  .required()
  .options({ abortEarly: true, allowUnknown: false });

export class UpdateTodoDTO {
  title?: string;
  description?: string;
  status?: TodoStatus;
}

// .or() = at least one updatable field must be present
export const UpdateTodoSchema = Joi.object({
  title: Joi.string().min(2).max(120).optional(),
  description: Joi.string().max(2000).optional(),
  status: Joi.string()
    .valid(...Object.values(TodoStatus))
    .optional(),
})
  .or("title", "description", "status")
  .required()
  .options({ abortEarly: true, allowUnknown: false });

export class ListTodosDTO implements PaginationQuery {
  page?: number;
  limit?: number;
  status?: TodoStatus;
}

export const ListTodosSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).optional(),
  status: Joi.string()
    .valid(...Object.values(TodoStatus))
    .optional(),
})
  .required()
  .options({ abortEarly: true, allowUnknown: false });
