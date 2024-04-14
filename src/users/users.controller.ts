import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateIsNumberStringPipe } from './pipes/validate-is-number-string.pipe';
import { GetCurrentUser, Public } from 'src/common/decorator';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  getMe(@GetCurrentUser() user: User) {
    return user;
  }

  @Public()
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Post()
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
  updateUserById(
    @Param('id', ValidateIsNumberStringPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  deleteuserById(@Param('id', ValidateIsNumberStringPipe) id: string) {
    return this.userService.deleteUserById(id);
  }
}
