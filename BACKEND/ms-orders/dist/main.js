"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('MICROSERVICIO DE PEDIDOS')
        .setDescription('En este microservicio esta toda la logica del negocio de pedidos')
        .setVersion('1.0')
        .addBearerAuth()
        .addServer('http://localhost:3003', 'Local Dev')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/v1/api-docs', app, document, {
        swaggerOptions: {
            docExpansion: 'none',
            defaultModelsExpandDepth: -1,
            filter: true,
            persistAuthorization: true,
        },
    });
    await app.listen(process.env.PORT || 3003);
}
bootstrap();
//# sourceMappingURL=main.js.map