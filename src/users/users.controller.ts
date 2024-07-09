import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateIsNumberStringPipe } from './pipes/validate-is-number-string.pipe';
import {
  AuthSwagger,
  GetCurrentUser,
  Public,
  Roles,
} from 'src/common/decorator';
import { User } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NoCacheInterceptor } from 'src/common/interceptor/no-cache.interceptor';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  @AuthSwagger()
  @ApiOkResponse({
    description: 'OK',
  })
  @UseInterceptors(NoCacheInterceptor)
  getMe(@GetCurrentUser() user: User) {
    return user;
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'User data retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
    description: 'Search by name',
    example: 'Maegan',
  })
  getUsers(@Query('page') page: number = 1, @Query('search') search: string) {
    return this.userService.getUsers({ page, search });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @AuthSwagger()
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
  })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  createUser(@Body() createUserDto: CreateUserDto) {
    const { facultadId } = createUserDto; // Extrae facultadId de createUserDto
    return this.userService.createUser(facultadId, createUserDto);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: 'User data retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUserById(@Param('id', ValidateIsNumberStringPipe) id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCENTE, Role.ADMIN)
  @AuthSwagger()
  @ApiOkResponse({ description: 'The user has been successfully updated.' })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  updateUserById(
    @Param('id', ValidateIsNumberStringPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCENTE, Role.ADMIN)
  @AuthSwagger()
  @ApiOkResponse({ description: 'The user has been successfully deleted.' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  deleteuserById(@Param('id', ValidateIsNumberStringPipe) id: string) {
    return this.userService.deleteUserById(id);
  }
}
