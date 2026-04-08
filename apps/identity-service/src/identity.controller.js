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
exports.IdentityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("../../../libs/common/src");
const dto_1 = require("./dto");
const identity_service_1 = require("./identity.service");
let IdentityController = class IdentityController {
    constructor(identityService) {
        this.identityService = identityService;
    }
    createPersona(dto) {
        return this.identityService.createPersona(dto);
    }
    getPersonaById(id) {
        return this.identityService.getPersonaById(id);
    }
    updatePersona(id, dto) {
        return this.identityService.updatePersona(id, dto);
    }
    buscarPorDocumento(tipoDocumentoId, numeroDocumento) {
        return this.identityService.buscarPorDocumento(tipoDocumentoId, numeroDocumento);
    }
    getTiposDocumento() {
        return this.identityService.getTiposDocumento();
    }
    getGeneros() {
        return this.identityService.getGeneros();
    }
};
exports.IdentityController = IdentityController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('personas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CrearPersonaDto]),
    __metadata("design:returntype", void 0)
], IdentityController.prototype, "createPersona", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('personas/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IdentityController.prototype, "getPersonaById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('personas/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ActualizarPersonaDto]),
    __metadata("design:returntype", void 0)
], IdentityController.prototype, "updatePersona", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('personas/buscar-por-documento'),
    __param(0, (0, common_1.Query)('tipoDocumentoId')),
    __param(1, (0, common_1.Query)('numeroDocumento')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IdentityController.prototype, "buscarPorDocumento", null);
__decorate([
    (0, common_2.Public)(),
    (0, common_1.Get)('tipos-documento'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IdentityController.prototype, "getTiposDocumento", null);
__decorate([
    (0, common_2.Public)(),
    (0, common_1.Get)('generos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IdentityController.prototype, "getGeneros", null);
exports.IdentityController = IdentityController = __decorate([
    (0, swagger_1.ApiTags)('Identity'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [identity_service_1.IdentityService])
], IdentityController);
//# sourceMappingURL=identity.controller.js.map