import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { Tokens } from './types';
import {
  AuthSwagger,
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/common/decorator';
import { RefreshTokenGuard } from 'src/common/guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signup')
  @ApiCreatedResponse({ description: 'User successfully signed up.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  signupLocal(@Body() dto: SignupDto) {
    const { facultadId } = dto;
    return this.authService.signupLocal(facultadId, dto); // Llamar al servicio de autenticación
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'User successfully signed in.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async siginLocal(
    @Res({ passthrough: true }) res,
    @Body() dto: SigninDto,
  ): Promise<Tokens> {
    const tokens = await this.authService.siginLocal(dto);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true, //accessible only by web server
      secure: false, //https
      sameSite: 'None', //cross-site cookie
      expires: new Date(Date.now() + 15 * 60 * 1000), //cookie expiry: set to match aT
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return tokens;
  }

  @Put('change-password')
  @AuthSwagger()
  @ApiOkResponse({ description: 'Successfully change password.' })
  @ApiForbiddenResponse({ description: 'Invalid credentials.' })
  async changePassword(
    @GetCurrentUserId() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Public()
  @Put('forgot-password')
  @ApiOkResponse({
    description: 'If this user exists, they will receive an email.',
  })
  @AuthSwagger()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('logout')
  @AuthSwagger()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'User successfully logged out.' })
  logout(@GetCurrentUserId() userId: string, @Res({ passthrough: true }) res) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
    });

    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Tokens successfully refreshed.' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token.' })
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
