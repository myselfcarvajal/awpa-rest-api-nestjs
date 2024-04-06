import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto } from './dto/auth-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthSignupDto) {
    const { facultadId } = dto;
    return this.authService.signup(facultadId, dto); // Llamar al servicio de autenticación
  }
}
