import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 1) Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2) Prefijo global de rutas
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  if (!port) {
    Logger.error('PORT environment variable is not defined', 'Bootstrap');
    process.exit(1);
  }

  // 3) Construir configuración de Swagger con esquema Bearer
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MICROSERVICIO DE GEOLOCALIZACIÓN Y RUTAS')
    .setDescription('Microservicio de Geolocalización y Asignación de Rutas')
    .setVersion('1.0')
    // Aquí agregamos la configuración de Bearer para JWT
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese “Bearer <token>” para autenticarse',
      },
      'JWT-auth', // nombre interno del esquema
    )
    .addServer(`http://localhost:${port}`, 'Local Dev')
    .build();

  // 4) Generar documento de Swagger (respetando el prefijo global)
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
  });

  // 5) Montar Swagger UI en /api/v1/api-docs con opciones:
  SwaggerModule.setup('api/v1/api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      filter: true,
      persistAuthorization: true, // para que no borre el token al recargar
    },
  });

  // 6) Iniciar servidor
  await app.listen(port);
  Logger.log(`ms-GeoRouting corriendo en http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Swagger disponible en http://localhost:${port}/api/v1/api-docs`,
    'Bootstrap',
  );
}

bootstrap();
