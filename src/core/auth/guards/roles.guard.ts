import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User, UserRole } from "@prisma/client";
import { ROLES_KEY } from "../../../common/decorators/roles.decorator";

/**
 * Role-based access control. Use together with JwtGuard:
 *
 *   @UseGuards(JwtGuard, RolesGuard)
 *   @Roles(UserRole.ADMIN)
 *   @Delete(":id")
 *   removeAnyTodo(...) {}
 *
 * ADMIN always passes, regardless of the specific roles listed.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: User }>();
    if (!user) {
      return false;
    }
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    return requiredRoles.includes(user.role);
  }
}
