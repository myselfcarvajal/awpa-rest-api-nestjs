import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFacultadeDto {
  @IsString()
  @IsNotEmpty()
  codigoFacultad: string;

  @IsString()
  @IsNotEmpty()
  nombreFacultad: string;
}
