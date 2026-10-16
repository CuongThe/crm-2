/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);


  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: '*', // Sau này có thể siết lại thành domain cụ thể như 'http://localhost:3000'
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường thừa không khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu client gửi trường lạ
      transform: true, // Tự động convert kiểu (string -> number, etc.)
    }),
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
