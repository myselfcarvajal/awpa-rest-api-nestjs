import { SetMetadata } from '@nestjs/common';
import { Action, AppSubjects } from 'src/casl/casl-ability.factory';

export interface RequiredRule {
  action: Action;
  subject: AppSubjects;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilites = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
