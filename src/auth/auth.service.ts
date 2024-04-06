import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { AuthSignupDto } from './dto/auth-signup.dto';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}
  signup(facultadId: string, authSignupDto: AuthSignupDto) {
    return this.userService.createUser(facultadId, authSignupDto);
  }
}
