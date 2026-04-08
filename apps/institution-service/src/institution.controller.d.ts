import { JwtPayload } from '@libs/common';
import { ActualizarInstitucionDto, ConfiguracionInstitucionDto, CrearAnioLectivoDto, CrearEscalaValoracionDto, CrearInstitucionDto, CrearPeriodoAcademicoDto, CrearSedeDto } from './dto';
import { InstitutionService } from './institution.service';
export declare class InstitutionController {
    private readonly institutionService;
    constructor(institutionService: InstitutionService);
    createInstitucion(dto: CrearInstitucionDto, currentUser: JwtPayload): Promise<import("../../../libs/database/src").Institucion>;
    findInstituciones(): Promise<import("../../../libs/database/src").Institucion[]>;
    findInstitucionById(id: string): Promise<import("../../../libs/database/src").Institucion>;
    updateInstitucion(id: string, dto: ActualizarInstitucionDto): Promise<import("../../../libs/database/src").Institucion>;
    createSede(institucionId: string, dto: CrearSedeDto): Promise<import("../../../libs/database/src").Sede>;
    findSedes(institucionId: string): Promise<import("../../../libs/database/src").Sede[]>;
    createAnioLectivo(institucionId: string, dto: CrearAnioLectivoDto): Promise<import("../../../libs/database/src").AnioLectivo>;
    findAniosLectivos(institucionId: string): Promise<import("../../../libs/database/src").AnioLectivo[]>;
    createPeriodo(anioLectivoId: string, dto: CrearPeriodoAcademicoDto): Promise<import("../../../libs/database/src").PeriodoAcademico>;
    findPeriodos(anioLectivoId: string): Promise<import("../../../libs/database/src").PeriodoAcademico[]>;
    cerrarPeriodo(periodoId: string): Promise<import("../../../libs/database/src").PeriodoAcademico>;
    upsertConfiguracion(institucionId: string, dto: ConfiguracionInstitucionDto): Promise<import("../../../libs/database/src").ConfiguracionInstitucion>;
    getConfiguracion(institucionId: string): Promise<import("../../../libs/database/src").ConfiguracionInstitucion | null>;
    createEscalaValoracion(institucionId: string, dto: CrearEscalaValoracionDto): Promise<{
        niveles: import("../../../libs/database/src").NivelEscalaValoracion[];
        institucionId: string;
        nombre: string;
        descripcion: string | null;
        activa: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findEscalasValoracion(institucionId: string): Promise<{
        niveles: import("../../../libs/database/src").NivelEscalaValoracion[];
        institucionId: string;
        nombre: string;
        descripcion: string | null;
        activa: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
