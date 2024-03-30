-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCENTE', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwd" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "role" "Role"[],
    "facultadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastlogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facultad" (
    "codigoFacultad" TEXT NOT NULL,
    "nombreFacultad" TEXT NOT NULL,

    CONSTRAINT "facultad_pkey" PRIMARY KEY ("codigoFacultad")
);

-- CreateTable
CREATE TABLE "publicacion" (
    "idPublicacion" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT[],
    "descripcion" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicadorId" TEXT NOT NULL,
    "facultadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publicacion_pkey" PRIMARY KEY ("idPublicacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "facultad"("codigoFacultad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion" ADD CONSTRAINT "publicacion_publicadorId_fkey" FOREIGN KEY ("publicadorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion" ADD CONSTRAINT "publicacion_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "facultad"("codigoFacultad") ON DELETE RESTRICT ON UPDATE CASCADE;
