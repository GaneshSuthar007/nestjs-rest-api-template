import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Pulls the authenticated user (attached by JwtStrategy) off the request.
 *
 *   getProfile(@GetUser() user: User) {}          // whole user
 *   getEmail(@GetUser("email") email: string) {}  // single property
 */
export const GetUser = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return property ? request.user?.[property] : request.user;
  },
);
