import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { Tokens } from './types';
import { GetCurrentUser, GetCurrentUserId, Public } from 'src/common/decorator';
import { RefreshTokenGuard } from 'src/common/guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signup')
  signupLocal(@Body() dto: SignupDto) {
    const { facultadId } = dto;
    return this.authService.signupLocal(facultadId, dto); // Llamar al servicio de autenticación
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  async siginLocal(
    @Res({ passthrough: true }) res,
    @Body() dto: SigninDto,
  ): Promise<Tokens> {
    const tokens = await this.authService.siginLocal(dto);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string, @Res({ passthrough: true }) res) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
