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
exports.InstitutionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("../../../libs/common/src");
const dto_1 = require("./dto");
const institution_service_1 = require("./institution.service");
let InstitutionController = class InstitutionController {
    constructor(institutionService) {
        this.institutionService = institutionService;
    }
    createInstitucion(dto, currentUser) {
        return this.institutionService.createInstitucion(dto, currentUser);
    }
    findInstituciones() {
        return this.institutionService.findInstituciones();
    }
    findInstitucionById(id) {
        return this.institutionService.findInstitucionById(id);
    }
    updateInstitucion(id, dto) {
        return this.institutionService.updateInstitucion(id, dto);
    }
    createSede(institucionId, dto) {
        return this.institutionService.createSede(institucionId, dto);
    }
    findSedes(institucionId) {
        return this.institutionService.findSedes(institucionId);
    }
    createAnioLectivo(institucionId, dto) {
        return this.institutionService.createAnioLectivo(institucionId, dto);
    }
    findAniosLectivos(institucionId) {
        return this.institutionService.findAniosLectivos(institucionId);
    }
    createPeriodo(anioLectivoId, dto) {
        return this.institutionService.createPeriodo(anioLectivoId, dto);
    }
    findPeriodos(anioLectivoId) {
        return this.institutionService.findPeriodos(anioLectivoId);
    }
    cerrarPeriodo(periodoId) {
        return this.institutionService.cerrarPeriodo(periodoId);
    }
    upsertConfiguracion(institucionId, dto) {
        return this.institutionService.upsertConfiguracion(institucionId, dto);
    }
    getConfiguracion(institucionId) {
        return this.institutionService.getConfiguracion(institucionId);
    }
    createEscalaValoracion(institucionId, dto) {
        return this.institutionService.createEscalaValoracion(institucionId, dto);
    }
    findEscalasValoracion(institucionId) {
        return this.institutionService.findEscalasValoracion(institucionId);
    }
};
exports.InstitutionController = InstitutionController;
__decorate([
    (0, common_2.Roles)(common_2.ROLE_SUPERADMIN),
    (0, common_1.Post)('instituciones'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CrearInstitucionDto, Object]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "createInstitucion", null);
__decorate([
    (0, common_1.Get)('instituciones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "findInstituciones", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Get)('instituciones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "findInstitucionById", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Patch)('instituciones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ActualizarInstitucionDto]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "updateInstitucion", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Post)('instituciones/:id/sedes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CrearSedeDto]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "createSede", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Get)('instituciones/:id/sedes'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "findSedes", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Post)('instituciones/:id/anios-lectivos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CrearAnioLectivoDto]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "createAnioLectivo", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Get)('instituciones/:id/anios-lectivos'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "findAniosLectivos", null);
__decorate([
    (0, common_1.Post)('anios-lectivos/:id/periodos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CrearPeriodoAcademicoDto]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "createPeriodo", null);
__decorate([
    (0, common_1.Get)('anios-lectivos/:id/periodos'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "findPeriodos", null);
__decorate([
    (0, common_1.Post)('periodos/:id/cerrar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "cerrarPeriodo", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Put)('instituciones/:id/configuracion'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ConfiguracionInstitucionDto]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "upsertConfiguracion", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Get)('instituciones/:id/configuracion'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "getConfiguracion", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Post)('instituciones/:id/escalas-valoracion'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CrearEscalaValoracionDto]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "createEscalaValoracion", null);
__decorate([
    (0, common_2.InstitutionScoped)({ param: 'id' }),
    (0, common_1.Get)('instituciones/:id/escalas-valoracion'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstitutionController.prototype, "findEscalasValoracion", null);
exports.InstitutionController = InstitutionController = __decorate([
    (0, swagger_1.ApiTags)('Institution'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [institution_service_1.InstitutionService])
], InstitutionController);
//# sourceMappingURL=institution.controller.js.map