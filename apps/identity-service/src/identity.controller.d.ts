import { ActualizarPersonaDto, CrearPersonaDto } from './dto';
import { IdentityService } from './identity.service';
export declare class IdentityController {
    private readonly identityService;
    constructor(identityService: IdentityService);
    createPersona(dto: CrearPersonaDto): Promise<import("../../../libs/database/src").Persona>;
    getPersonaById(id: string): Promise<import("../../../libs/database/src").Persona>;
    updatePersona(id: string, dto: ActualizarPersonaDto): Promise<import("../../../libs/database/src").Persona>;
    buscarPorDocumento(tipoDocumentoId: string, numeroDocumento: string): Promise<import("../../../libs/database/src").Persona>;
    getTiposDocumento(): Promise<import("../../../libs/database/src").TipoDocumento[]>;
    getGeneros(): Promise<import("../../../libs/database/src").Genero[]>;
}
