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
exports.AccessControlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("../../../libs/common/src");
const dto_1 = require("./dto");
const access_control_service_1 = require("./access-control.service");
let AccessControlController = class AccessControlController {
    constructor(accessControlService) {
        this.accessControlService = accessControlService;
    }
    getContextoAcceso(usuarioId) {
        return this.accessControlService.getContextoAcceso(usuarioId);
    }
    getPermisosEfectivos(usuarioId) {
        return this.accessControlService.getPermisosEfectivos(usuarioId);
    }
    asignarPerfil(usuarioId, dto) {
        return this.accessControlService.asignarPerfil(usuarioId, dto);
    }
    asignarRol(usuarioId, dto) {
        return this.accessControlService.asignarRol(usuarioId, dto);
    }
    asignarAdministradorApp(institucionId, dto) {
        return this.accessControlService.asignarAdministradorApp(institucionId, dto);
    }
};
exports.AccessControlController = AccessControlController;
__decorate([
    (0, common_1.Get)('usuarios/:id/contexto-acceso'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessControlController.prototype, "getContextoAcceso", null);
__decorate([
    (0, common_1.Get)('usuarios/:id/permisos-efectivos'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessControlController.prototype, "getPermisosEfectivos", null);
__decorate([
    (0, common_2.Roles)(common_2.ROLE_SUPERADMIN),
    (0, common_1.Post)('usuarios/:id/perfiles'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AsignarPerfilDto]),
    __metadata("design:returntype", void 0)
], AccessControlController.prototype, "asignarPerfil", null);
__decorate([
    (0, common_2.Roles)(common_2.ROLE_SUPERADMIN),
    (0, common_1.Post)('usuarios/:id/roles'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AsignarRolDto]),
    __metadata("design:returntype", void 0)
], AccessControlController.prototype, "asignarRol", null);
__decorate([
    (0, common_2.Roles)(common_2.ROLE_SUPERADMIN),
    (0, common_1.Post)('instituciones/:id/administradores-app'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AsignarAdministradorAppDto]),
    __metadata("design:returntype", void 0)
], AccessControlController.prototype, "asignarAdministradorApp", null);
exports.AccessControlController = AccessControlController = __decorate([
    (0, swagger_1.ApiTags)('Access Control'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [access_control_service_1.AccessControlService])
], AccessControlController);
//# sourceMappingURL=access-control.controller.js.map