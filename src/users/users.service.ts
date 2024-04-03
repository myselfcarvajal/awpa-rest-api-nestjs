import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(facultadId: string, createUserDto: CreateUserDto) {
    // Validar si el id ya existe en la base de datos
    const existingId = await this.prisma.user.findUnique({
      where: { id: createUserDto.id },
    });

    if (existingId) {
      throw new HttpException('ID already exists', HttpStatus.BAD_REQUEST);
    }

    // Validar si el email ya existe en la base de datos
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    // Si el id y el email son únicos, crear el usuario
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        facultadId,
      },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpException('User Not Found', 404);

    return user;
  }

  async deleteUserById(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // async updateUserById(id: string, data: Prisma.UserUpdateInput) {
  //   const findUser = await this.getUserById(id);

  //   if (data.email && data.email !== findUser.email) {
  //     // Verificar si el correo electrónico ha cambiado
  //     const userWithEmail = await this.prisma.user.findUnique({
  //       where: { email: data.email as string },
  //     });
  //     if (userWithEmail) {
  //       throw new HttpException('Email already taken', 404);
  //     }
  //   }

  //   return this.prisma.user.update({ where: { id }, data });
  // }

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
