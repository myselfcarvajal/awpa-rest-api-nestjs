import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  // @IsString()
  @IsNotEmpty()
  autor: string[];

  @IsOptional()
  @IsString()
  url?: string;

  // publicadorId String
  // facultadId   String
}
