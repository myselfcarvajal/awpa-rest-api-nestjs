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
import { AuthSwagger, Public, Roles } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guard';
import { Role } from 'src/common/enums/role.enum';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('facultades')
@Controller('facultades')
export class FacultadesController {
  constructor(private readonly facultadesService: FacultadesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @AuthSwagger()
  @ApiCreatedResponse({ description: 'Facultad successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  createFacultad(@Body() createFacultadeDto: CreateFacultadeDto) {
    return this.facultadesService.createFacultad(createFacultadeDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Facultades retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'No facultades found.' })
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
    description: 'Search by name of faculty',
    example: 'Bellas Artes',
  })
  getFacultades(
    @Query('page') page: number = 1,
    @Query('search') search: string,
  ) {
    return this.facultadesService.getFacultades({ page, search });
  }

  @Public()
  @ApiOkResponse({ description: 'Facultade retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Facultad not found.' })
  @Get(':id')
  getFacultadById(@Param('id') codigoFacultad: string) {
    return this.facultadesService.getFacultadById(codigoFacultad);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @AuthSwagger()
  @ApiOkResponse({ description: 'Facultad successfully updated.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiNotFoundResponse({ description: 'Facultad not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  updateFacultadById(
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
  @AuthSwagger()
  @ApiOkResponse({ description: 'Facultad successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Facultad not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  deleteFacultadById(@Param('id') codigoFacultad: string) {
    return this.facultadesService.deleteFacultadById(codigoFacultad);
  }
}
