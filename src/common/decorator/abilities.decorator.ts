import { SetMetadata } from '@nestjs/common';
import { Action, Subjects } from 'src/casl/casl-ability.factory';

export interface RequiredRule {
  action: Action;
  subject: Subjects;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilites = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
