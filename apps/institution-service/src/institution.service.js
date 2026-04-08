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
exports.InstitutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const database_1 = require("../../../libs/database/src");
let InstitutionService = class InstitutionService {
    constructor(institucionesRepository, sedesRepository, aniosLectivosRepository, periodosRepository, configuracionesRepository, escalasRepository, nivelesRepository) {
        this.institucionesRepository = institucionesRepository;
        this.sedesRepository = sedesRepository;
        this.aniosLectivosRepository = aniosLectivosRepository;
        this.periodosRepository = periodosRepository;
        this.configuracionesRepository = configuracionesRepository;
        this.escalasRepository = escalasRepository;
        this.nivelesRepository = nivelesRepository;
    }
    async createInstitucion(dto, currentUser) {
        if (!currentUser.superadministrador) {
            throw new common_1.ForbiddenException('Solo el superadministrador puede crear instituciones');
        }
        return this.institucionesRepository.save(this.institucionesRepository.create({
            codigo: dto.codigo,
            nombre: dto.nombre,
            nit: dto.nit ?? null,
            activo: true,
        }));
    }
    findInstituciones() {
        return this.institucionesRepository.find({ order: { nombre: 'ASC' } });
    }
    async findInstitucionById(id) {
        const institucion = await this.institucionesRepository.findOneBy({ id });
        if (!institucion) {
            throw new common_1.NotFoundException('Institucion no encontrada');
        }
        return institucion;
    }
    async updateInstitucion(id, dto) {
        const institucion = await this.findInstitucionById(id);
        Object.assign(institucion, dto);
        return this.institucionesRepository.save(institucion);
    }
    async createSede(institucionId, dto) {
        await this.findInstitucionById(institucionId);
        return this.sedesRepository.save(this.sedesRepository.create({
            institucionId,
            codigo: dto.codigo,
            nombre: dto.nombre,
            principal: dto.principal ?? false,
        }));
    }
    findSedes(institucionId) {
        return this.sedesRepository.find({
            where: { institucionId },
            order: { nombre: 'ASC' },
        });
    }
    async createAnioLectivo(institucionId, dto) {
        await this.findInstitucionById(institucionId);
        return this.aniosLectivosRepository.save(this.aniosLectivosRepository.create({
            institucionId,
            nombre: dto.nombre,
            fechaInicio: dto.fechaInicio,
            fechaFin: dto.fechaFin,
            activo: true,
            cerrado: false,
        }));
    }
    findAniosLectivos(institucionId) {
        return this.aniosLectivosRepository.find({
            where: { institucionId },
            order: { fechaInicio: 'DESC' },
        });
    }
    async createPeriodo(anioLectivoId, dto) {
        await this.findAnioLectivoById(anioLectivoId);
        return this.periodosRepository.save(this.periodosRepository.create({
            anioLectivoId,
            nombre: dto.nombre,
            fechaInicio: dto.fechaInicio,
            fechaFin: dto.fechaFin,
            orden: dto.orden,
            cerrado: false,
        }));
    }
    findPeriodos(anioLectivoId) {
        return this.periodosRepository.find({
            where: { anioLectivoId },
            order: { orden: 'ASC' },
        });
    }
    async cerrarPeriodo(periodoId) {
        const periodo = await this.periodosRepository.findOneBy({ id: periodoId });
        if (!periodo) {
            throw new common_1.NotFoundException('Periodo academico no encontrado');
        }
        periodo.cerrado = true;
        return this.periodosRepository.save(periodo);
    }
    async upsertConfiguracion(institucionId, dto) {
        await this.findInstitucionById(institucionId);
        const existente = await this.configuracionesRepository.findOne({
            where: { institucionId },
        });
        if (existente) {
            existente.zonaHoraria = dto.zonaHoraria ?? existente.zonaHoraria;
            existente.idioma = dto.idioma ?? existente.idioma;
            existente.configuracion = dto.configuracion ?? existente.configuracion;
            return this.configuracionesRepository.save(existente);
        }
        return this.configuracionesRepository.save(this.configuracionesRepository.create({
            institucionId,
            zonaHoraria: dto.zonaHoraria ?? 'America/Bogota',
            idioma: dto.idioma ?? 'es-CO',
            configuracion: dto.configuracion ?? null,
        }));
    }
    async getConfiguracion(institucionId) {
        await this.findInstitucionById(institucionId);
        return this.configuracionesRepository.findOne({
            where: { institucionId },
        });
    }
    async createEscalaValoracion(institucionId, dto) {
        await this.findInstitucionById(institucionId);
        const escala = await this.escalasRepository.save(this.escalasRepository.create({
            institucionId,
            nombre: dto.nombre,
            descripcion: dto.descripcion ?? null,
            activa: true,
        }));
        const niveles = dto.niveles.map((nivel) => this.nivelesRepository.create({
            escalaValoracionId: escala.id,
            codigo: nivel.codigo,
            nombre: nivel.nombre,
            valorMinimo: nivel.valorMinimo,
            valorMaximo: nivel.valorMaximo,
            aprobado: nivel.aprobado ?? false,
            orden: nivel.orden,
        }));
        await this.nivelesRepository.save(niveles);
        return this.findEscalasValoracion(institucionId);
    }
    async findEscalasValoracion(institucionId) {
        const escalas = await this.escalasRepository.find({
            where: { institucionId },
            order: { nombre: 'ASC' },
        });
        const result = [];
        for (const escala of escalas) {
            const niveles = await this.nivelesRepository.find({
                where: { escalaValoracionId: escala.id },
                order: { orden: 'ASC' },
            });
            result.push({ ...escala, niveles });
        }
        return result;
    }
    async findAnioLectivoById(id) {
        const anio = await this.aniosLectivosRepository.findOneBy({ id });
        if (!anio) {
            throw new common_1.NotFoundException('Anio lectivo no encontrado');
        }
        return anio;
    }
};
exports.InstitutionService = InstitutionService;
exports.InstitutionService = InstitutionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Institucion)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.Sede)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.AnioLectivo)),
    __param(3, (0, typeorm_1.InjectRepository)(database_1.PeriodoAcademico)),
    __param(4, (0, typeorm_1.InjectRepository)(database_1.ConfiguracionInstitucion)),
    __param(5, (0, typeorm_1.InjectRepository)(database_1.EscalaValoracion)),
    __param(6, (0, typeorm_1.InjectRepository)(database_1.NivelEscalaValoracion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InstitutionService);
//# sourceMappingURL=institution.service.js.map