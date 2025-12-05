import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'src/app.module';
import { isDev } from 'src/common/utils';
import { ExceptionFilter } from 'src/nest/filters';
import { ClientExceptionsInterceptor } from 'src/nest/interceptors';

export class App {
  private readonly app: INestApplication;
  private readonly logger: Logger;
  private readonly apiPort: number;
  private readonly apiVersion: string;
  private readonly apiPrefix: string;
  private readonly swaggerTitle: string;
  private readonly swaggerDescription: string;
  private readonly swaggerPath: string;
  private readonly origin: string;
  private readonly configService: ConfigService;

  constructor(app: INestApplication) {
    this.app = app;
    this.logger = new Logger(App.name);
    this.configService = app.get(ConfigService);
    this.apiPort = this.configService.getOrThrow<number>('API_PORT');
    this.apiPrefix = this.configService.getOrThrow<string>('API_PREFIX');
    this.swaggerTitle = this.configService.getOrThrow<string>('SWAGGER_TITLE');
    this.swaggerDescription = this.configService.getOrThrow<string>(
      'SWAGGER_DESCRIPTION',
    );
    this.swaggerPath = this.configService.getOrThrow<string>('SWAGGER_PATH');
    this.origin = this.configService.getOrThrow<string>('ORIGIN_URL');
  }

  private appConfig() {
    this.app.setGlobalPrefix(this.apiPrefix);
    this.app.enableVersioning({
      defaultVersion: this.apiVersion,
      type: VersioningType.URI,
    });
    this.app.enableCors({
      credentials: true,
      origin: isDev() ? '*' : this.origin,
    });
    return this;
  }

  private swaggerConfig() {
    if (!isDev()) {
      return this;
    }
    const options = new DocumentBuilder()
      .setTitle(this.swaggerTitle)
      .setDescription(this.swaggerDescription)
      .setVersion(this.apiVersion)
      .build();
    const document = SwaggerModule.createDocument(this.app, options);
    SwaggerModule.setup(
      `${this.apiPrefix}/${this.swaggerPath}`,
      this.app,
      document,
      {
        swaggerOptions: { persistAuthorization: true },
      },
    );
    this.logger.log(`Swagger is running on ${this.swaggerPath}`);
    return this;
  }

  private validationConfig() {
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    return this;
  }

  private assignInterceptors() {
    this.app.useGlobalInterceptors(new ClientExceptionsInterceptor());
    return this;
  }

  private assignFilters() {
    this.app.useGlobalFilters(new ExceptionFilter());
    return this;
  }

  private async runApp() {
    await this.app.listen(this.apiPort);
    if (isDev()) {
      this.logger.log(`Server is running on port ${this.apiPort}`);
    }
    return this;
  }

  public static async run() {
    const app = await NestFactory.create(AppModule, {
      cors: !isDev(),
    });

    await new App(app)
      .appConfig()
      .assignInterceptors()
      .assignFilters()
      .swaggerConfig()
      .validationConfig()
      .runApp();
  }
}
