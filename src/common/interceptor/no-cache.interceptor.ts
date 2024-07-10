import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class NoCacheInterceptor extends CacheInterceptor {
  excludePaths = ['/api/v1/users/me', '/api/v1/health'];

  isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return (
      this.allowedMethods.includes(req.method) &&
      !this.excludePaths.includes(req.url)
    );
  }
}
