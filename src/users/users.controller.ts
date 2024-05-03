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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateIsNumberStringPipe } from './pipes/validate-is-number-string.pipe';
import { GetCurrentUser, Public, Roles } from 'src/common/decorator';
import { User } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  getMe(@GetCurrentUser() user: User) {
    return user;
  }

  @Public()
  @Get()
  getUsers(@Query('page') page: number = 1, @Query('search') search: string) {
    return this.userService.getUsers({ page, search });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createUser(@Body() createUserDto: CreateUserDto) {
    const { facultadId } = createUserDto; // Extrae facultadId de createUserDto
    return this.userService.createUser(facultadId, createUserDto);
  }

  @Public()
  @Get(':id')
  getUserById(@Param('id', ValidateIsNumberStringPipe) id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCENTE, Role.ADMIN)
  updateUserById(
    @Param('id', ValidateIsNumberStringPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCENTE, Role.ADMIN)
  deleteuserById(@Param('id', ValidateIsNumberStringPipe) id: string) {
    return this.userService.deleteUserById(id);
  }
}
