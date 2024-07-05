import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Role } from '../common/enums/role.enum';

import { JwtPayload } from 'src/auth/types';
import { User, Publicacion, Facultad } from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppSubjects =
  | 'all'
  | Subjects<{
      User: User;
      Publicacion: Publicacion;
      Facultad: Facultad;
    }>;

type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JwtPayload) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    console.log(user);
    // Allow anyone to read facultades, publicaciones, and users
    can(Action.Read, ['Facultad', 'Publicacion', 'User']);

    // Admins
    if (user.role.includes(Role.ADMIN)) {
      can(Action.Manage, 'all'); // Admin can manage everything

      // Only restrict Create on Publicacion if the user is not also a DOCENTE
      if (!user.role.includes(Role.DOCENTE)) {
        cannot(Action.Create, 'Publicacion').because(
          'Only DOCENTE can create publications.',
        ); // Admin cannot create publicaciones
      }
    }

    // Docentes
    if (user.role.includes(Role.DOCENTE)) {
      can(Action.Create, 'Publicacion'); // Docente can create publicaciones

      can([Action.Update, Action.Delete], 'Publicacion', {
        publicadorId: user.sub,
      }).because(
        "Can't update or delete this publication because is not yours",
      );

      // can(Action.Update, 'Publicacion', { publicadorId: user.sub });
      // can(Action.Delete, 'Publicacion', { publicadorId: user.sub });

      cannot(Action.Create, 'User').because('You cannot create new users.');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<InferSubjects<AppAbility>>,
    });
  }
}
