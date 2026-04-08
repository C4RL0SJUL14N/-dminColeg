"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSupportModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
let AuthSupportModule = class AuthSupportModule {
};
exports.AuthSupportModule = AuthSupportModule;
exports.AuthSupportModule = AuthSupportModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, jwt_1.JwtModule.register({})],
        providers: [password_service_1.PasswordService, token_service_1.TokenService],
        exports: [password_service_1.PasswordService, token_service_1.TokenService, jwt_1.JwtModule],
    })
], AuthSupportModule);
//# sourceMappingURL=auth-support.module.js.map