import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './modules/app.module';
import { AUTH_COOKIE_NAME } from './modules/common/utils/cookie.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'],
    credentials: true
  });
  app.use(cookieParser());
  app.use(helmet());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Texnika.kz API')
    .setDescription('Texnika.kz marketplace backend API')
    .setVersion('0.1.0')
    .addCookieAuth(AUTH_COOKIE_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
