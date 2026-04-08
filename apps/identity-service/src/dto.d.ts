export declare class CrearPersonaDto {
    tipoDocumentoId: string;
    generoId?: string;
    numeroDocumento: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    correoElectronico?: string;
    telefono?: string;
}
export declare class ActualizarPersonaDto {
    generoId?: string;
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    correoElectronico?: string;
    telefono?: string;
}
