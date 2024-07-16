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
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('throttler.RATE_TTL'),
          limit: configService.get('throttler.RATE_LIMIT'),
        },
      ],
    }),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get('redis.HOST'),
        port: configService.get('redis.PORT'),
        ttl: configService.get('redis.TTL'),
      }),
      inject: [ConfigService],
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
