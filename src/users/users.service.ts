import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(facultadId: string, createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          facultadId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('id')) {
        throw new HttpException('ID already exists', HttpStatus.BAD_REQUEST);
      } else if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('email')
      ) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
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
    // Obtener el usuario actual
    const currentUser = await this.getUserById(id);

    // Verificar si se está intentando cambiar el ID
    if (data.id && data.id !== currentUser.id) {
      // Verificar si el nuevo ID ya está en uso por otro usuario
      const userWithNewId = await this.prisma.user.findUnique({
        where: { id: data.id as string },
      });

      if (userWithNewId) {
        throw new HttpException('ID already taken', HttpStatus.BAD_REQUEST);
      }
    }

    // Verificar si se está intentando cambiar el correo electrónico
    if (data.email && data.email !== currentUser.email) {
      // Verificar si el nuevo correo electrónico ya está en uso por otro usuario
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (userWithEmail) {
        throw new HttpException('Email already taken', HttpStatus.BAD_REQUEST);
      }
    }

    // Actualizar el usuario
    return this.prisma.user.update({ where: { id }, data });
  }
}
