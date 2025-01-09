import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerRunner {
  private config: DocumentBuilder;
  private app: INestApplication;

  constructor(app) {
    this.app = app;
    this.config = new DocumentBuilder();
  }

  run() {
    this.createDocument();
  }

  private setup() {
    return this.config
      .setTitle(`Api Nestjs`)
      .setDescription('API Nestjs')
      .setVersion('1.0')
      .build();
  }

  private createDocument() {
    const document = SwaggerModule.createDocument(this.app, this.setup());
    SwaggerModule.setup('/docs', this.app, document);
  }
}
