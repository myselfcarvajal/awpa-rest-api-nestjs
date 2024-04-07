import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwt: JwtService,
  ) {}
  signup(facultadId: string, signupDto: SignupDto) {
    return this.userService.createUser(facultadId, signupDto);
  }

  async sigin(signinDto: SigninDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: signinDto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.passwd, signinDto.passwd);
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    // return this.signToke(user.id, user.email);
    return this.signToke(user.id, user.email);
  }

  async signToke(id: string, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: id,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: `${process.env.JWT_SECRET}`,
    });

    return { access_token: token };
  }
}
