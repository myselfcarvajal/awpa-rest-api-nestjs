import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/common/decorator';
import { NoCacheInterceptor } from 'src/common/interceptor/no-cache.interceptor';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Health check succeeded.' })
  @ApiServiceUnavailableResponse({ description: 'Service Unavailable' })
  @UseInterceptors(NoCacheInterceptor)
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),

      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),

      () =>
        this.disk.checkStorage('storage', { thresholdPercent: 0.8, path: '/' }),
    ]);
  }
}
