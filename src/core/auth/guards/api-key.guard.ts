import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { messages } from "../../../common/messages";

/**
 * First line of defense: EVERY request to the API must carry a valid
 * `x-api-key` header. Registered globally in main.ts, so no controller
 * needs to think about it.
 *
 * This keeps random internet traffic and scanners off the API even for
 * public (non-JWT) endpoints — only your own clients know the key.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers["x-api-key"];

    if (!apiKey || apiKey !== this.config.get<string>("API_KEY")) {
      throw new UnauthorizedException(messages.common.invalidApiKey);
    }
    return true;
  }
}
