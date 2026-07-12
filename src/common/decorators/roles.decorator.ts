import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * Marks a route (or controller) as restricted to the given roles.
 * Must be combined with JwtGuard + RolesGuard:
 *
 *   @UseGuards(JwtGuard, RolesGuard)
 *   @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
