import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { Tokens } from './types';
import { GetCurrentUser, GetCurrentUserId } from 'src/common/decorator';
import { AccessTokenGuard, RefreshTokenGuard } from 'src/common/guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/signup')
  signupLocal(@Body() dto: SignupDto) {
    const { facultadId } = dto;
    return this.authService.signupLocal(facultadId, dto); // Llamar al servicio de autenticación
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  siginLocal(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.siginLocal(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string) {
    return this.authService.logout(userId);
  }

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
