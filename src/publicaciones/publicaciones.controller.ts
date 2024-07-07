import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import {
  AuthSwagger,
  GetCurrentUser,
  Public,
  Roles,
} from 'src/common/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtPayload } from 'src/auth/types';
import { OwnershipGuard, PublicationGuard } from 'src/common/guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('publicaciones')
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  @UseGuards(PublicationGuard)
  @Roles(Role.DOCENTE)
  @AuthSwagger()
  @ApiCreatedResponse({ description: 'Publication created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data or file not valid.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        autor: {
          type: 'array',
          items: { type: 'string' },
          example: ['Mario lopez', 'Pedro Paz'],
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  createPublicacion(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1048576 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @GetCurrentUser() { sub, facultadId }: JwtPayload,
    @Body() createPublicacioneDto: CreatePublicacionDto,
  ) {
    return this.publicacionesService.createPublicacion(
      createPublicacioneDto,
      sub,
      facultadId,
      file,
    );
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Publications retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'No publications found.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by title term',
    example: 'thesis',
  })
  getPublicaciones(
    @Query('page') page: number = 1,
    @Query('search') search: string,
  ) {
    return this.publicacionesService.getPublicaciones({ page, search });
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: 'Publication retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Publication not found.' })
  getPublicacioneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicacionesService.getPublicacioneById(id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @UseInterceptors(FileInterceptor('file'))
  @AuthSwagger()
  @ApiOkResponse({ description: 'Publication updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data or file not valid.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  @ApiNotFoundResponse({ description: 'Publication not found.' })
  async updatePublicacionById(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1048576 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() updatePublicacioneDto: UpdatePublicacionDto,
  ) {
    return this.publicacionesService.updatePublicacionById(
      id,
      updatePublicacioneDto,
      file,
    );
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @AuthSwagger()
  @ApiOkResponse({ description: 'Publication deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  @ApiNotFoundResponse({ description: 'Publication not found.' })
  deletePublicacionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicacionesService.deletePublicacionById(id);
  }
}
