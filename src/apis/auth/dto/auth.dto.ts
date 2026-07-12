import * as Joi from "joi";

/**
 * DTO class + Joi schema live together in one file per feature.
 * DTOs are plain classes (no decorators) — validation is Joi's job,
 * wired in via JoiValidationPipe on the handler.
 */

export class RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export const RegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
})
  .required()
  .options({ abortEarly: true, allowUnknown: false });

export class LoginDTO {
  email: string;
  password: string;
}

export const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})
  .required()
  .options({ abortEarly: true, allowUnknown: false });
