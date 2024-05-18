import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PublicacionesService } from 'src/publicaciones/publicaciones.service';
import { Role } from 'src/common/enums/role.enum';
import { JwtPayload } from 'src/auth/types';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private publicacionesService: PublicacionesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    const publicacionId = request.params.id;

    // Obtener la publicación
    const publicacion =
      await this.publicacionesService.getPublicacioneById(publicacionId);

    // Verificar si el usuario es dueño de la publicación o es administrador
    if (
      publicacion.publicador.id !== user.sub &&
      !user.role.includes(Role.ADMIN)
    ) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }

    return true;
  }
}
