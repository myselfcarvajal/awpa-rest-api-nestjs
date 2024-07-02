import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Publicacion } from 'src/publicaciones/entity/publicacion.entity';
import { Facultad } from 'src/facultades/entities/facultad.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | InferSubjects<typeof User | typeof Publicacion | typeof Facultad>
  | 'all';
type PossibleAbilities = [Action, Subjects];
type Conditions = MongoQuery;

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    // Allow anyone to read facultades, publicaciones, and users
    can(Action.Read, [Facultad, Publicacion, User]);

    // Admins
    if (user.role.includes(Role.ADMIN)) {
      can(Action.Manage, 'all'); // Admin can manage everything

      // Only restrict Create on Publicacion if the user is not also a DOCENTE
      if (!user.role.includes(Role.DOCENTE)) {
        cannot(Action.Create, Publicacion).because('only docentes!!!'); // Admin cannot create publicaciones
      }
    }

    // Docentes
    if (user.role.includes(Role.DOCENTE)) {
      can(Action.Create, Publicacion); // Docente can create publicaciones
      can([Action.Update, Action.Delete], Publicacion, {
        publicadorId: user.id,
      });
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
