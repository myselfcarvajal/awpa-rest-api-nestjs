import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFacultadeDto } from './dto/create-facultade.dto';
import { UpdateFacultadeDto } from './dto/update-facultade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Facultad, Prisma } from '@prisma/client';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/prisma/paginator';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class FacultadesService {
  constructor(private prisma: PrismaService) {}

  async createFacultad(createFacultadeDto: CreateFacultadeDto) {
    try {
      return await this.prisma.facultad.create({
        data: createFacultadeDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'Facultad already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      throw error;
    }
  }

  async getFacultades({
    where,
    orderBy,
    page,
    search,
  }: {
    where?: Prisma.FacultadWhereInput;
    orderBy?: Prisma.FacultadOrderByWithRelationInput;
    page?: number;
    search?: string;
  }): Promise<PaginatedResult<Facultad>> {
    const searchCondition: Prisma.FacultadWhereInput = search
      ? {
          nombreFacultad: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : undefined;

    where = {
      ...where,
      ...searchCondition,
    };
    return paginate(
      this.prisma.facultad,
      {
        where,
        orderBy,
      },
      {
        page,
      },
    );
  }

  async getFacultadById(codigoFacultad: string) {
    const facultad = await this.prisma.facultad.findUnique({
      where: { codigoFacultad },
    });

    if (!facultad) throw new HttpException('Facultad Not Found', 404);

    return facultad;
  }

  async updateFacultadById(
    codigoFacultad: string,
    updateFacultadeDto: UpdateFacultadeDto,
  ) {
    try {
      await this.getFacultadById(codigoFacultad);
      const deleteFacultad = await this.prisma.facultad.update({
        where: { codigoFacultad },
        data: updateFacultadeDto,
      });

      return deleteFacultad;
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('codigoFacultad')) {
          throw new HttpException(
            'Could not update codigoFacultad because it already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      throw error;
    }
  }

  async deleteFacultadById(codigoFacultad: string) {
    try {
      await this.getFacultadById(codigoFacultad);
      const deleteFacultad = await this.prisma.facultad.delete({
        where: { codigoFacultad },
      });

      return deleteFacultad;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new HttpException(
            'Facultad cannot be deleted, has associated posts.',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw error;
    }
  }
}
