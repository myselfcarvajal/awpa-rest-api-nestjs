import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { Public } from 'src/common/decorator';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  create(@Body() createPublicacioneDto: CreatePublicacionDto) {
    return this.publicacionesService.createPublicacion(createPublicacioneDto);
  }

  @Public()
  @Get()
  getPublicaciones(
    @Query('page') page: number = 1,
    @Query('search') search: string,
  ) {
    return this.publicacionesService.getPublicaciones({ page, search });
  }

  @Get(':id')
  getPublicacioneById(@Param('id') id: string) {
    return this.publicacionesService.getPublicacioneById(+id);
  }

  @Patch(':id')
  updatePublicacionById(
    @Param('id') id: string,
    @Body() updatePublicacioneDto: UpdatePublicacionDto,
  ) {
    return this.publicacionesService.updatePublicacionById(
      +id,
      updatePublicacioneDto,
    );
  }

  @Delete(':id')
  deletePublicacionById(@Param('id') id: string) {
    return this.publicacionesService.deletePublicacionById(+id);
  }
}
