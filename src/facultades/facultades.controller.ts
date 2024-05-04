import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FacultadesService } from './facultades.service';
import { CreateFacultadeDto } from './dto/create-facultade.dto';
import { UpdateFacultadeDto } from './dto/update-facultade.dto';
import { Public, Roles } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guard';
import { Role } from 'src/common/enums/role.enum';

@Controller('facultades')
export class FacultadesController {
  constructor(private readonly facultadesService: FacultadesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createFacultad(@Body() createFacultadeDto: CreateFacultadeDto) {
    return this.facultadesService.createFacultad(createFacultadeDto);
  }

  @Public()
  @Get()
  getFacultades(
    @Query('page') page: number = 1,
    @Query('search') search: string,
  ) {
    return this.facultadesService.getFacultades({ page, search });
  }

  @Public()
  @Get(':id')
  getFacultadById(@Param('id') codigoFacultad: string) {
    return this.facultadesService.getFacultadById(codigoFacultad);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') codigoFacultad: string,
    @Body() updateFacultadeDto: UpdateFacultadeDto,
  ) {
    return this.facultadesService.updateFacultadById(
      codigoFacultad,
      updateFacultadeDto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteFacultadById(@Param('id') codigoFacultad: string) {
    return this.facultadesService.deleteFacultadById(codigoFacultad);
  }
}
