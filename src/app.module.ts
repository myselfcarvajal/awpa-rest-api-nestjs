import { Logger, Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccessTokenGuard } from './common/guard';
import { FacultadesModule } from './facultades/facultades.module';
import { HealthModule } from './health/health.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UploadModule } from './upload/upload.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    AuthModule,
    UsersModule,
    PrismaModule,
    FacultadesModule,
    PublicacionesModule,
    HealthModule,
    UploadModule,
  ],

  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
