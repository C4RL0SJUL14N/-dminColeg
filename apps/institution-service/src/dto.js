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
exports.CrearEscalaValoracionDto = exports.CrearNivelEscalaDto = exports.ConfiguracionInstitucionDto = exports.CrearPeriodoAcademicoDto = exports.CrearAnioLectivoDto = exports.CrearSedeDto = exports.ActualizarInstitucionDto = exports.CrearInstitucionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CrearInstitucionDto {
}
exports.CrearInstitucionDto = CrearInstitucionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearInstitucionDto.prototype, "codigo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearInstitucionDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearInstitucionDto.prototype, "nit", void 0);
class ActualizarInstitucionDto {
}
exports.ActualizarInstitucionDto = ActualizarInstitucionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActualizarInstitucionDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActualizarInstitucionDto.prototype, "nit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ActualizarInstitucionDto.prototype, "activo", void 0);
class CrearSedeDto {
}
exports.CrearSedeDto = CrearSedeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearSedeDto.prototype, "codigo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearSedeDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CrearSedeDto.prototype, "principal", void 0);
class CrearAnioLectivoDto {
}
exports.CrearAnioLectivoDto = CrearAnioLectivoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearAnioLectivoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CrearAnioLectivoDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CrearAnioLectivoDto.prototype, "fechaFin", void 0);
class CrearPeriodoAcademicoDto {
}
exports.CrearPeriodoAcademicoDto = CrearPeriodoAcademicoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearPeriodoAcademicoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CrearPeriodoAcademicoDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CrearPeriodoAcademicoDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CrearPeriodoAcademicoDto.prototype, "orden", void 0);
class ConfiguracionInstitucionDto {
}
exports.ConfiguracionInstitucionDto = ConfiguracionInstitucionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfiguracionInstitucionDto.prototype, "zonaHoraria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfiguracionInstitucionDto.prototype, "idioma", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ConfiguracionInstitucionDto.prototype, "configuracion", void 0);
class CrearNivelEscalaDto {
}
exports.CrearNivelEscalaDto = CrearNivelEscalaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearNivelEscalaDto.prototype, "codigo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearNivelEscalaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], CrearNivelEscalaDto.prototype, "valorMinimo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], CrearNivelEscalaDto.prototype, "valorMaximo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CrearNivelEscalaDto.prototype, "aprobado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CrearNivelEscalaDto.prototype, "orden", void 0);
class CrearEscalaValoracionDto {
}
exports.CrearEscalaValoracionDto = CrearEscalaValoracionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearEscalaValoracionDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearEscalaValoracionDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CrearNivelEscalaDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CrearNivelEscalaDto),
    __metadata("design:type", Array)
], CrearEscalaValoracionDto.prototype, "niveles", void 0);
//# sourceMappingURL=dto.js.map