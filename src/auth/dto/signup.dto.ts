import { Role } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNumberString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  passwd: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsNotEmpty()
  @IsEnum(Role, {
    each: true, // Permitir validación para cada elemento del arreglo
    message: 'Valid role required',
  })
  @ArrayUnique()
  @ArrayMaxSize(2, { message: 'Maximum two roles allowed' })
  role: Role[];

  // @IsNotEmpty()
  // facultad: { connect: { codigoFacultad: string } };

  @IsNotEmpty()
  facultadId: string;
}
