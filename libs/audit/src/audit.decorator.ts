import { SetMetadata } from '@nestjs/common';
import { AUDIT_METADATA_KEY } from './audit.constants';
import { AuditOptions } from './audit.types';

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA_KEY, options);

