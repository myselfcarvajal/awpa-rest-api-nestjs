import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateIsNumberStringPipe } from './pipes/validate-is-number-string.pipe';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto) {
    const { facultadId } = createUserDto; // Extrae facultadId de createUserDto
    return this.userService.createUser(facultadId, createUserDto);
  }

  @Get(':id')
  @UsePipes(ValidateIsNumberStringPipe)
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  @UsePipes(ValidateIsNumberStringPipe)
  deleteuserById(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
