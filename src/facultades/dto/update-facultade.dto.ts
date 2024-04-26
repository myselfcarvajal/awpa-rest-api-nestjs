import { PartialType } from '@nestjs/mapped-types';
import { CreateFacultadeDto } from './create-facultade.dto';

export class UpdateFacultadeDto extends PartialType(CreateFacultadeDto) {}
