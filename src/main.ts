import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('servicedelegue');

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Service des Delegué API')
    .setDescription('rapport des activité des delegue')
    .setVersion('1.0')
    .build();

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
      customSiteTitle: 'Service des Delegué API',
    },
  });

  app.getHttpAdapter().get('/servicedelegue/doc-json', (req: any,res: any) => {
    res.json(document)
  })

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
