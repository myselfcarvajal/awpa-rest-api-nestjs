import { Module } from '@nestjs/common';
import { FacultadesService } from './facultades.service';
import { FacultadesController } from './facultades.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FacultadesController],
  providers: [FacultadesService],
})
export class FacultadesModule {}
