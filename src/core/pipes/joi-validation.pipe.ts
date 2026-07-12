import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectSchema } from "joi";

/**
 * Validates request payloads against a Joi schema.
 *
 * Applied per handler (never class-level), so each endpoint owns exactly
 * one schema:
 *
 *   @Post()
 *   @UsePipes(new JoiValidationPipe(CreateTodoSchema))     // validates body
 *   create(@Body() dto: CreateTodoDTO) {}
 *
 *   @Get()
 *   list(@Query(new JoiValidationPipe(ListSchema)) q) {}   // validates query
 *
 * Values from custom param decorators (e.g. @GetUser()) are passed through
 * untouched.
 */
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === "custom") {
      return value;
    }

    const { error, value: validated } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException(error.details.map((d) => d.message).join(", "));
    }
    return validated;
  }
}
