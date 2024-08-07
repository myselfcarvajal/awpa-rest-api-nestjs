import {
  BadRequestException,
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
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  signupLocal(facultadId: string, signupDto: SignupDto) {
    return this.userService.createUser(facultadId, {
      ...signupDto,
      role: [Role.DOCENTE],
    });
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
      //delete any existing reset tokens for this user
      await this.prisma.resetPasswordToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      //generate a new reset token
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

  async resetPassword(resetToken: string, newPassword: string) {
    //find a valid reset token
    const token = await this.prisma.resetPasswordToken.findFirst({
      where: {
        token: resetToken,
        expiryDate: {
          gte: new Date(),
        },
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    //Change user password (HASH!!)
    const user = await this.prisma.user.findUnique({
      where: {
        id: token.userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Unable to reset password');
    }

    //change user's password
    const newHashPassword = await argon.hash(newPassword);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwd: newHashPassword,
      },
    });

    // delete the used reset token
    await this.prisma.resetPasswordToken.delete({
      where: {
        id: token.id,
      },
    });

    return { message: 'Password reset successfully' };
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
        expiresIn: this.configService.get<string>('jwt.ACCESS_EXPIRES_IN'),
        secret: this.configService.get<string>('jwt.ACCESS_SECRET'),
      }),

      this.jwtService.signAsync(jwtPayload, {
        expiresIn: this.configService.get<string>('jwt.REFRESH_EXPIRES_IN'),
        secret: this.configService.get<string>('jwt.REFRESH_SECRET'),
      }),
    ]);

    return { access_token: at, refresh_token: rt };
  }
}
