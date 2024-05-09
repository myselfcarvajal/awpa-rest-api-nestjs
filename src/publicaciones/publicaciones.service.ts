import { Injectable } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/prisma/paginator';
import { Prisma, Publicacion } from '@prisma/client';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PublicacionesService {
  constructor(private prisma: PrismaService) {}

  createPublicacion(createPublicacioneDto: CreatePublicacionDto) {
    return 'This action adds a new publicacione';
  }

  getPublicaciones({
    where,
    orderBy,
    page,
    search,
  }: {
    where?: Prisma.PublicacionWhereInput;
    orderBy?: Prisma.PublicacionOrderByWithRelationInput;
    page?: number;
    search?: string;
  }): Promise<PaginatedResult<Publicacion>> {
    // Construir la condición de búsqueda
    const searchCondition: Prisma.PublicacionWhereInput = search
      ? {
          titulo: {
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
      this.prisma.publicacion,
      // include: { facultad: true, users: true },
      {
        select: {
          idPublicacion: true,
          titulo: true,
          autor: true,
          descripcion: true,
          url: true,
          publicador: {
            select: { id: true, email: true, facultadId: true },
          },
          // publicadorId: true,
          // facultadId: true,

          facultad: true,
          createdAt: true,
          updatedAt: true,
        },
        where,
        orderBy,
      },
      {
        page,
      },
    );
  }

  getPublicacioneById(id: number) {
    return `This action returns a #${id} publicacione`;
  }

  deletePublicacionById(id: number) {
    return `This action removes a #${id} publicacione`;
  }

  updatePublicacionById(
    id: number,
    updatePublicacionDto: UpdatePublicacionDto,
  ) {
    return `This action updates a #${id} publicacione`;
  }
}
