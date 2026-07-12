import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Apply to any controller/handler that requires a logged-in user:
 *   @UseGuards(JwtGuard)
 */
@Injectable()
export class JwtGuard extends AuthGuard("jwt") {}
