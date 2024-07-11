import {
  IsEmail,
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

  // @IsNotEmpty()
  // facultad: { connect: { codigoFacultad: string } };

  @IsNotEmpty()
  facultadId: string;
}
