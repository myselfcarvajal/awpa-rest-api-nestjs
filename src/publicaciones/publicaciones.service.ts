import { HttpException, Injectable } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/prisma/paginator';
import { Prisma, Publicacion } from '@prisma/client';
import { UploadService } from 'src/upload/upload.service';
import { normalizeText } from 'src/common/utils/normalize-text';
import { extractFileNameFromUrl } from 'src/common/utils';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PublicacionesService {
  constructor(
    private prisma: PrismaService,
    private s3upload: UploadService,
  ) {}

  async createPublicacion(
    createPublicacioneDto: CreatePublicacionDto,
    sub: string,
    facultadId: string,
    file: Express.Multer.File,
  ) {
    try {
      const title = await this.prisma.publicacion.findUnique({
        where: { titulo: createPublicacioneDto.titulo },
      });

      if (title) throw new HttpException('Title alredy exist', 400);

      const url = await this.addFileToPost(file);
      const publicadorId = sub;

      return this.prisma.publicacion.create({
        data: {
          ...createPublicacioneDto,
          publicadorId,
          facultadId,
          url,
        },
      });
    } catch (error) {
      throw error;
    }
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
      // include: { facultad: true, publicador: true },
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

  async getPublicacioneById(idPublicacion: string) {
    const post = await this.prisma.publicacion.findUnique({
      where: { idPublicacion },

      select: {
        idPublicacion: true,
        titulo: true,
        autor: true,
        descripcion: true,
        url: true,
        publicador: {
          select: { id: true, email: true, facultadId: true },
        },

        facultad: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!post) throw new HttpException('Publication Not Found', 404);

    return post;
  }

  async deletePublicacionById(idPublicacion: string) {
    try {
      await this.getPublicacioneById(idPublicacion);
      const deletePost = await this.prisma.publicacion.delete({
        where: { idPublicacion },
      });

      // Extraemos el nombre del archivo de la URL
      const fileName = extractFileNameFromUrl(deletePost.url);
      await this.s3upload.deleteFile(fileName);

      return deletePost;
    } catch (error) {
      throw error;
    }
  }

  async updatePublicacionById(
    idPublicacion: string,
    updatePublicacionDto: UpdatePublicacionDto,
    file?: Express.Multer.File,
  ) {
    try {
      const post = await this.getPublicacioneById(idPublicacion);

      if (file) {
        // Delete the old file if a new file is uploaded
        await this.s3upload.deleteFile(extractFileNameFromUrl(post.url));

        // Upload the new file
        const url = await this.addFileToPost(file);

        updatePublicacionDto.url = url;
      }

      const updatePost = await this.prisma.publicacion.update({
        where: { idPublicacion },
        data: updatePublicacionDto,
      });

      return updatePost;
    } catch (error) {
      throw error;
    }
  }

  async addFileToPost(file: Express.Multer.File): Promise<string> {
    const bucketKey = `${Date.now()}-${normalizeText(file.originalname)}`;
    const fileUrl = await this.s3upload.uploadFile(file, bucketKey);

    return fileUrl;
  }
}
