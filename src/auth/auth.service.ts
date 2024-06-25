import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Tokens } from './types';
import { nanoid } from 'nanoid';
import { MailService } from 'src/services/mail.service';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  signupLocal(facultadId: string, signupDto: SignupDto) {
    return this.userService.createUser(facultadId, signupDto);
  }

  async siginLocal(signinDto: SigninDto): Promise<Tokens> {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: signinDto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) throw new UnauthorizedException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.passwd, signinDto.passwd);
    // if password incorrect throw exception
    if (!pwMatches) throw new UnauthorizedException('Credentials incorrect');
    // return this.signToke(user.id, user.email);

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.facultadId,
    );

    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    //find the user
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('User not found...');

    //compare the old password with the password in DB
    const pwMatches = await argon.verify(user.passwd, oldPassword);
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Wrong credentials');

    //change user's password
    const newHashPassword = await argon.hash(newPassword);

    // update the user's password
    const updatedPasswd = await this.prisma.user.update({
      where: { id: userId },
      data: { passwd: newHashPassword },
    });

    return updatedPasswd;
  }

  async forgotPassword(email: string) {
    //check that user exists
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      //if user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);

      await this.prisma.resetPasswordToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiryDate,
        },
      });

      //send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async logout(userId: string): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.facultadId,
    );

    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(id: string, refreshToken: string) {
    const hash = await argon.hash(refreshToken);

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async getTokens(
    id: string,
    email: string,
    role: string[],
    facultadId: string,
  ): Promise<Tokens> {
    const jwtPayload = {
      sub: id,
      email,
      role,
      facultadId,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        expiresIn: '15m',
        secret: `${process.env.JWT_ACCESS_SECRET}`,
      }),

      this.jwtService.signAsync(jwtPayload, {
        expiresIn: '1d',
        secret: `${process.env.JWT_REFRESH_SECRET}`,
      }),
    ]);

    return { access_token: at, refresh_token: rt };
  }
}
