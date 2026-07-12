import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { messages } from "../../../common/messages";

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

/**
 * Validates `Authorization: Bearer <token>` and attaches the fresh DB user
 * to `request.user` (retrieved via the @GetUser() decorator).
 *
 * The user is re-fetched from the database on every request so revoked /
 * deleted accounts are rejected immediately, even with a valid token.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException(messages.auth.unauthorized);
    }
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
