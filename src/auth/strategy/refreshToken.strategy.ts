import { Request as RequestType } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload, JwtPayloadWithRt } from '../types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractRefreshToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('jwt.REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  private static extractRefreshToken(req: RequestType): string | null {
    if (
      req.cookies &&
      'refresh_token' in req.cookies &&
      req.cookies.refresh_token.length > 0
    ) {
      return req.cookies.refresh_token;
    }
    return null;
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = RefreshTokenStrategy.extractRefreshToken(req);

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
