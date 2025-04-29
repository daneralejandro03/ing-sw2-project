import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de validación global (sin cambios)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. Prefijo de todas las rutas (sin cambios)
  app.setGlobalPrefix('api/v1');

  // 3. DocumentBuilder enriquecido
  const config = new DocumentBuilder()
    .setTitle('MICROSERVICIO DE SEGURIDAD')
    .setDescription('En este microservicio esta la gestión de usuarios, roles, permisos, y muchisimas mas autoridades')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3001/api/v1/', 'Local Dev')
    .build();

  // 4. Generación del documento OpenAPI
  const document = SwaggerModule.createDocument(app, config);

  // 5. Montaje de la UI con opciones avanzadas
  SwaggerModule.setup('api/v1/api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      filter: true,
      persistAuthorization: true,
    },

  });

  await app.listen(process.env.PORT!);
}

bootstrap();
