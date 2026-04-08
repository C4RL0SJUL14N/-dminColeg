"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_1 = require("../../../libs/database/src");
const institution_controller_1 = require("./institution.controller");
const institution_service_1 = require("./institution.service");
let InstitutionServiceModule = class InstitutionServiceModule {
};
exports.InstitutionServiceModule = InstitutionServiceModule;
exports.InstitutionServiceModule = InstitutionServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([database_1.AnioLectivo, database_1.ConfiguracionInstitucion, database_1.EscalaValoracion, database_1.Institucion, database_1.NivelEscalaValoracion, database_1.PeriodoAcademico, database_1.Sede])],
        controllers: [institution_controller_1.InstitutionController],
        providers: [institution_service_1.InstitutionService],
        exports: [institution_service_1.InstitutionService],
    })
], InstitutionServiceModule);
//# sourceMappingURL=institution-service.module.js.map