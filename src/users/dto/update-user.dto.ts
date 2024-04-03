import { Role } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  passwd?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEnum(Role, {
    each: true, // Permitir validación para cada elemento del arreglo
    message: 'Valid role required',
  })
  @ArrayUnique()
  @ArrayMaxSize(2, { message: 'Maximum two roles allowed' })
  role?: Role[];

  @IsOptional()
  facultadId?: string;
}
