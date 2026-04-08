import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles, ROLE_SUPERADMIN } from '@libs/common';
import {
  AuditListResponseDto,
  AuditSearchDto,
  AuditSummaryListResponseDto,
} from './audit.dto';
import { AuditService } from './audit.service';

@ApiTags('Auditorias')
@ApiBearerAuth()
@Roles(ROLE_SUPERADMIN)
@Controller('auditorias')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOkResponse({ type: AuditListResponseDto })
  async findAll(@Query() query: AuditSearchDto) {
    return this.auditService.searchEvents(query);
  }

  @Get('resumen')
  @ApiOkResponse({ type: AuditSummaryListResponseDto })
  async getSummary(@Query() query: AuditSearchDto) {
    return this.auditService.getSummary(query);
  }
}
