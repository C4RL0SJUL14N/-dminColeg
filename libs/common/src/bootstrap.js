"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApplication = configureApplication;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const helmet_1 = __importDefault(require("helmet"));
const api_exception_filter_1 = require("./exceptions/api-exception.filter");
const response_envelope_interceptor_1 = require("./interceptors/response-envelope.interceptor");
function configureApplication(app, options) {
    app.use((0, helmet_1.default)());
    app.use(cookieParser());
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new api_exception_filter_1.ApiExceptionFilter());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)), new response_envelope_interceptor_1.ResponseEnvelopeInterceptor());
    if (options.globalPrefix) {
        app.setGlobalPrefix(options.globalPrefix);
    }
    const config = new swagger_1.DocumentBuilder()
        .setTitle(options.appName)
        .setDescription(options.appDescription)
        .setVersion(options.version ?? '0.1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
}
//# sourceMappingURL=bootstrap.js.map