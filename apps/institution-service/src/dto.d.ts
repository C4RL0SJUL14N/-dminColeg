export declare class CrearInstitucionDto {
    codigo: string;
    nombre: string;
    nit?: string;
}
export declare class ActualizarInstitucionDto {
    nombre?: string;
    nit?: string;
    activo?: boolean;
}
export declare class CrearSedeDto {
    codigo: string;
    nombre: string;
    principal?: boolean;
}
export declare class CrearAnioLectivoDto {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
}
export declare class CrearPeriodoAcademicoDto {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    orden: number;
}
export declare class ConfiguracionInstitucionDto {
    zonaHoraria?: string;
    idioma?: string;
    configuracion?: Record<string, unknown>;
}
export declare class CrearNivelEscalaDto {
    codigo: string;
    nombre: string;
    valorMinimo: string;
    valorMaximo: string;
    aprobado?: boolean;
    orden: number;
}
export declare class CrearEscalaValoracionDto {
    nombre: string;
    descripcion?: string;
    niveles: CrearNivelEscalaDto[];
}
