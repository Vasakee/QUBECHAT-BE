"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_response_interceptor_1 = require("./common/interceptors/app-response.interceptor");
const dotenv = __importStar(require("dotenv"));
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const fs = __importStar(require("fs"));
async function bootstrap() {
    dotenv.config();
    const logger = new common_1.Logger('Bootstrap');
    if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
        logger.log('Created uploads directory');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'http://localhost:3000',
                'http://localhost:4000',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:4000',
            ];
            // Allow requests without origin (like Postman or curl)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Studygai EdTech API')
        .setDescription('AI-Powered Study Assistant API with PDF processing and chat capabilities')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'jwt',
        description: 'Enter JWT token',
    }, 'jwt')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('/docs', app, document, {
        customSiteTitle: 'SAGE API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    logger.log('Swagger UI available at /docs');
    // Register global response interceptor to enforce IAppResponse shape
    app.useGlobalInterceptors(new app_response_interceptor_1.AppResponseInterceptor());
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`SAGE Backend running on http://localhost:${port}`);
    logger.log(`API Documentation: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map