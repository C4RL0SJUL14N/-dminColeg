import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@libs/common';
import { ActualizarPersonaDto, CrearPersonaDto } from './dto';
import { IdentityService } from './identity.service';

@ApiTags('Identity')
@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @ApiBearerAuth()
  @Post('personas')
  createPersona(@Body() dto: CrearPersonaDto) {
    return this.identityService.createPersona(dto);
  }

  @ApiBearerAuth()
  @Get('personas/buscar-por-documento')
  buscarPorDocumento(
    @Query('tipoDocumentoId') tipoDocumentoId: string,
    @Query('numeroDocumento') numeroDocumento: string,
  ) {
    return this.identityService.buscarPorDocumento(tipoDocumentoId, numeroDocumento);
  }

  @ApiBearerAuth()
  @Get('personas/:id')
  getPersonaById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.identityService.getPersonaById(id);
  }

  @ApiBearerAuth()
  @Patch('personas/:id')
  updatePersona(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarPersonaDto,
  ) {
    return this.identityService.updatePersona(id, dto);
  }

  @Public()
  @Get('tipos-documento')
  getTiposDocumento() {
    return this.identityService.getTiposDocumento();
  }

  @Public()
  @Get('generos')
  getGeneros() {
    return this.identityService.getGeneros();
  }
}
