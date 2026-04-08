"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const database_1 = require("../../../libs/database/src");
let IdentityService = class IdentityService {
    constructor(personasRepository, tiposDocumentoRepository, generosRepository) {
        this.personasRepository = personasRepository;
        this.tiposDocumentoRepository = tiposDocumentoRepository;
        this.generosRepository = generosRepository;
    }
    async createPersona(dto) {
        const existente = await this.personasRepository.findOne({
            where: {
                tipoDocumentoId: dto.tipoDocumentoId,
                numeroDocumento: dto.numeroDocumento,
            },
        });
        if (existente) {
            throw new common_1.ConflictException('La persona ya existe con ese documento');
        }
        return this.personasRepository.save(this.personasRepository.create({
            tipoDocumentoId: dto.tipoDocumentoId,
            generoId: dto.generoId ?? null,
            numeroDocumento: dto.numeroDocumento,
            primerNombre: dto.primerNombre,
            segundoNombre: dto.segundoNombre ?? null,
            primerApellido: dto.primerApellido,
            segundoApellido: dto.segundoApellido ?? null,
            correoElectronico: dto.correoElectronico ?? null,
            telefono: dto.telefono ?? null,
        }));
    }
    async getPersonaById(id) {
        const persona = await this.personasRepository.findOne({
            where: { id },
            relations: { tipoDocumento: true, genero: true },
        });
        if (!persona) {
            throw new common_1.NotFoundException('Persona no encontrada');
        }
        return persona;
    }
    async updatePersona(id, dto) {
        const persona = await this.getPersonaById(id);
        Object.assign(persona, {
            generoId: dto.generoId ?? persona.generoId,
            primerNombre: dto.primerNombre ?? persona.primerNombre,
            segundoNombre: dto.segundoNombre ?? persona.segundoNombre,
            primerApellido: dto.primerApellido ?? persona.primerApellido,
            segundoApellido: dto.segundoApellido ?? persona.segundoApellido,
            correoElectronico: dto.correoElectronico ?? persona.correoElectronico,
            telefono: dto.telefono ?? persona.telefono,
        });
        return this.personasRepository.save(persona);
    }
    async buscarPorDocumento(tipoDocumentoId, numeroDocumento) {
        const persona = await this.personasRepository.findOne({
            where: { tipoDocumentoId, numeroDocumento },
            relations: { tipoDocumento: true, genero: true },
        });
        if (!persona) {
            throw new common_1.NotFoundException('No existe persona con el documento consultado');
        }
        return persona;
    }
    getTiposDocumento() {
        return this.tiposDocumentoRepository.find({ order: { nombre: 'ASC' } });
    }
    getGeneros() {
        return this.generosRepository.find({ order: { nombre: 'ASC' } });
    }
};
exports.IdentityService = IdentityService;
exports.IdentityService = IdentityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Persona)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.TipoDocumento)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.Genero)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], IdentityService);
//# sourceMappingURL=identity.service.js.map