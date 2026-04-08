import { SetMetadata } from '@nestjs/common';
import { INSTITUTION_SCOPE_KEY } from '../constants/auth.constants';

export interface InstitutionScopeOptions {
  param?: string;
  body?: string;
  query?: string;
}

export const InstitutionScoped = (options: InstitutionScopeOptions) =>
  SetMetadata(INSTITUTION_SCOPE_KEY, options);

