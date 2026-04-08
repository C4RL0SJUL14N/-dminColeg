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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionContextGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_constants_1 = require("../constants/auth.constants");
let InstitutionContextGuard = class InstitutionContextGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const options = this.reflector.getAllAndOverride(auth_constants_1.INSTITUTION_SCOPE_KEY, [context.getHandler(), context.getClass()]);
        if (!options) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.superadministrador) {
            return true;
        }
        const scopedInstitutionId = (options.param ? request.params?.[options.param] : undefined) ??
            (options.query ? request.query?.[options.query] : undefined) ??
            (options.body ? String(request.body?.[options.body] ?? '') : undefined);
        if (!scopedInstitutionId) {
            return true;
        }
        if (scopedInstitutionId !== user.institucionId) {
            throw new common_1.ForbiddenException('No puede operar fuera de la institucion asociada a su usuario');
        }
        return true;
    }
};
exports.InstitutionContextGuard = InstitutionContextGuard;
exports.InstitutionContextGuard = InstitutionContextGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], InstitutionContextGuard);
//# sourceMappingURL=institution-context.guard.js.map