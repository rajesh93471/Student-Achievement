import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { MongoIdInterceptor } from './common/interceptors/mongo-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  const allowedOrigins = (
    process.env.CLIENT_URL?.split(',') || ['http://localhost:3000']
  ).map((o) => o.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
    }),
  );
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalInterceptors(new MongoIdInterceptor());

  app.setGlobalPrefix('achieve');

  // Log all registered routes for production troubleshooting
  const server = app.getHttpAdapter().getInstance();
  const routes = server?._router?.stack
    ?.filter((r: any) => r.route)
    ?.map((r: any) => `${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  
  if (routes) {
    console.log('--- Registered Routes ---');
    routes.forEach((r: string) => console.log(r));
    console.log('-------------------------');
  }

  const port = process.env.PORT || 5001;
  await app.listen(port, '0.0.0.0');
  console.log(`API running on port ${port} with prefix /achieve`);
}
bootstrap();
