import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guard';
import { FacultadesModule } from './facultades/facultades.module';
import { HealthModule } from './health/health.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    FacultadesModule,
    PublicacionesModule,
    HealthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
