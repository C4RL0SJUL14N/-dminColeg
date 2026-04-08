"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_1 = require("../../../libs/database/src");
const access_control_controller_1 = require("./access-control.controller");
const access_control_service_1 = require("./access-control.service");
let AccessControlServiceModule = class AccessControlServiceModule {
};
exports.AccessControlServiceModule = AccessControlServiceModule;
exports.AccessControlServiceModule = AccessControlServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([database_1.PerfilUsuario, database_1.Permiso, database_1.Rol, database_1.RolPermiso, database_1.RolUsuario, database_1.TipoPerfil, database_1.Usuario])],
        controllers: [access_control_controller_1.AccessControlController],
        providers: [access_control_service_1.AccessControlService],
        exports: [access_control_service_1.AccessControlService],
    })
], AccessControlServiceModule);
//# sourceMappingURL=access-control-service.module.js.map