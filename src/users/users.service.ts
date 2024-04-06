import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(facultadId: string, createUserDto: CreateUserDto) {
    try {
      //generate the password
      const hash = await argon.hash(createUserDto.passwd);

      // update password DTO with hash generate
      createUserDto.passwd = hash;

      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          facultadId,
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          passwd: false,
          createdAt: true,
          updatedAt: true,
          facultadId: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('id')) {
          throw new HttpException('ID already exists', HttpStatus.BAD_REQUEST);
        } else if (error.meta?.target?.includes('email')) {
          throw new HttpException(
            'Email already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (
        error.code === 'P2003' &&
        error.message.includes('user_facultadId_fkey')
      ) {
        throw new HttpException('La facultad no existe', HttpStatus.NOT_FOUND);
      } else {
        throw error;
      }
    }
  }

  async getUsers() {
    return this.prisma.user.findMany({
      // include: { facultad: true, publicaciones: true },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        role: true, //Don't send property
        createdAt: true,
        updatedAt: true,
        facultad: true,
        publicaciones: true,
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // include: { facultad: true, publicaciones: true },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        passwd: false,
        facultad: {
          select: {
            codigoFacultad: true,
            nombreFacultad: true,
          },
        },
        publicaciones: {
          select: {
            titulo: true,
            autor: true,
            descripcion: true,
            url: true,
          },
        },
      },
    });
    if (!user) throw new HttpException('User Not Found', 404);

    return user;
  }

  async deleteUserById(id: string) {
    await this.getUserById(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async updateUserById(id: string, data: UpdateUserDto) {
    try {
      await this.getUserById(id);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
      });

      return updatedUser; // Return the updated user object if successful
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('id')) {
          throw new HttpException(
            'Could not update id because it already exists',
            HttpStatus.BAD_REQUEST,
          );
        } else if (error.meta?.target?.includes('email')) {
          throw new HttpException(
            'Could not update email because it already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (
        error.code === 'P2003' &&
        error.message.includes('user_facultadId_fkey')
      ) {
        throw new HttpException('La facultad no existe', HttpStatus.NOT_FOUND);
      } else {
        throw error;
      }
    }
  }
}
