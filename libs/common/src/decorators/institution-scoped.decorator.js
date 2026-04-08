"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionScoped = void 0;
const common_1 = require("@nestjs/common");
const auth_constants_1 = require("../constants/auth.constants");
const InstitutionScoped = (options) => (0, common_1.SetMetadata)(auth_constants_1.INSTITUTION_SCOPE_KEY, options);
exports.InstitutionScoped = InstitutionScoped;
//# sourceMappingURL=institution-scoped.decorator.js.map