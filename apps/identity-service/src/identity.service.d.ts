import { Repository } from 'typeorm';
import { Genero, Persona, TipoDocumento } from '@libs/database';
import { ActualizarPersonaDto, CrearPersonaDto } from './dto';
export declare class IdentityService {
    private readonly personasRepository;
    private readonly tiposDocumentoRepository;
    private readonly generosRepository;
    constructor(personasRepository: Repository<Persona>, tiposDocumentoRepository: Repository<TipoDocumento>, generosRepository: Repository<Genero>);
    createPersona(dto: CrearPersonaDto): Promise<Persona>;
    getPersonaById(id: string): Promise<Persona>;
    updatePersona(id: string, dto: ActualizarPersonaDto): Promise<Persona>;
    buscarPorDocumento(tipoDocumentoId: string, numeroDocumento: string): Promise<Persona>;
    getTiposDocumento(): Promise<TipoDocumento[]>;
    getGeneros(): Promise<Genero[]>;
}
