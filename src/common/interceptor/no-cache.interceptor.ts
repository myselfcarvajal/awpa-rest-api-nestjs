import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext } from '@nestjs/common';

export class NoCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return undefined;
  }
}
