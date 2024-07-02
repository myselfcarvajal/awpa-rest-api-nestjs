import { $Enums } from '@prisma/client';

export class User {
  id: string;
  email: string;
  passwd: string;
  nombre: string;
  apellido: string;
  role: $Enums.Role[];
  facultadId: string;
  hashedRt: string | null;
  createdAt: Date;
  updatedAt: Date;
}
