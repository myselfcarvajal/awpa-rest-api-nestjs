import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    const { facultadId } = dto;
    return this.authService.signup(facultadId, dto); // Llamar al servicio de autenticación
  }
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  sigin(@Body() dto: SigninDto) {
    return this.authService.sigin(dto);
  }
}
