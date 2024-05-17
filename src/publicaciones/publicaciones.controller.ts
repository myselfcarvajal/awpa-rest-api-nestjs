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
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { GetCurrentUser, Public } from 'src/common/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtPayload } from 'src/auth/types';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
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
  getPublicaciones(
    @Query('page') page: number = 1,
    @Query('search') search: string,
  ) {
    return this.publicacionesService.getPublicaciones({ page, search });
  }

  @Public()
  @Get(':id')
  getPublicacioneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicacionesService.getPublicacioneById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updatePublicacionById(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePublicacioneDto: UpdatePublicacionDto,
  ) {
    return this.publicacionesService.updatePublicacionById(
      id,
      updatePublicacioneDto,
      file,
    );
  }

  @Delete(':id')
  deletePublicacionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicacionesService.deletePublicacionById(id);
  }
}
