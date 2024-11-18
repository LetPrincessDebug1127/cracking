import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator'; // Adjust the import path accordingly
import { UserRole } from './user-role.enum'; // Adjust the import path accordingly

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Ensure the user is set in the request (e.g., from a JWT payload)

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User role is missing');
    }

    const hasRole = () => requiredRoles.includes(user.role);
    if (hasRole()) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied: User does not have the required role',
    );
  }
}
