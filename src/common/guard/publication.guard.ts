import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator';
import { Role } from '../enums/role.enum';
import { JwtPayload } from 'src/auth/types';

@Injectable()
export class PublicationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole = requiredRoles.some((role) =>
      user.role.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }

    return true;
  }
}
