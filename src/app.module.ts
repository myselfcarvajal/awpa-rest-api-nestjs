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
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { NoCacheInterceptor } from './common/interceptor/no-cache.interceptor';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLER_RATE_TTL, 10),
        limit: parseInt(process.env.THROTTLER_RATE_LIMIT, 10),
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: `${process.env.REDIS_HOST}`,
      port: `${process.env.REDIS_PORT}`,
      ttl: parseInt(process.env.REDIS_TTL, 10),
    }),
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
      useClass: NoCacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
