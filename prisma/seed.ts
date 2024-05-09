import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';

const facultades = [
  {
    codigoFacultad: 'ACE',
    nombreFacultad: 'Administrativas, Contables y Económicas',
  },
  {
    codigoFacultad: 'DCPS',
    nombreFacultad: 'Derecho, Ciencias Políticas y Sociales',
  },
  {
    codigoFacultad: 'IT',
    nombreFacultad: 'Ingenierías Tecnológicas',
  },
  {
    codigoFacultad: 'BA',
    nombreFacultad: 'Bellas Artes',
  },
  {
    codigoFacultad: 'CBE',
    nombreFacultad: 'Ciencias Básicas y de la Educación',
  },
  {
    codigoFacultad: 'CS',
    nombreFacultad: 'Ciencias de la Salud',
  },
];

const users = [
  {
    id: '4325123212',
    email: 'mario@gmail.com',
    passwd: 'passwd',
    nombre: 'Mario',
    apellido: 'Lopez',
    role: ['ADMIN', 'DOCENTE'],
    facultadId: 'IT',
  },
  {
    id: '34425123',
    email: 'luna@gmail.com',
    passwd: 'passwd',
    nombre: 'Luna',
    apellido: 'Carvajal',
    role: ['DOCENTE'],
    facultadId: 'ACE',
  },
];

const publicaciones = [
  {
    titulo: '100 años de soledad',
    autor: ['Gabriel Garcia Marquez'],
    descripcion:
      'Cien años de soledad es una novela del escritor Colombiano Gabriel García Márquez, ganador del Premio Nobel de Literatura en 1982. Es considerada una obra maestra de la literatura hispanoamericana y universal, así como una de las obras más traducidas y leídas en español.',
    url: 'http://www.secst.cl/upfiles/documentos/19072016_1207am_578dc39115fe9.pdf',
    publicadorId: '34425123',
    facultadId: 'ACE',
  },
  {
    titulo:
      'Un Conjunto de Métricas para Proyectos de Transición de Software Offshore',
    autor: ['Natacha Lascano'],
    descripcion:
      'El presente trabajo de tesis tiene como objetivo desarrollar la definición de un conjunto de métricas para medir el avance y éxito de un proyecto de transición de software a locaciones offshore. El análisis se realizó por medio de una encuesta destinada a administradores de proyectos, gerentes de ingeniería y desarrolladores de software de proyectos de transición. Los resultados permitieron definir dichas métricas y desarrollar también una herramienta que permita la correcta recolección y control de las mismas durante el proceso de transición.',
    url: 'http://sedici.unlp.edu.ar/bitstream/handle/10915/32513/Documento_completo__.4.4)%20Un%20Conjunto%20de%20M%C3%A9tricas%20para%20Proyectos%20de%20Transici%C3%B3n%20de%20Software%20Offshore.pdf?sequence=1&isAllowed=y',
    publicadorId: '34425123',
    facultadId: 'ACE',
  },
  {
    titulo: 'Manual de Tesis y Trabajos de Investigación',
    autor: ['Lizbeth Alejandra Guevara'],
    descripcion:
      'Debido a que no hay una forma univoca de generar conocimientos a través de la investigación ya que existe una diversidad de posturas argumentativas desde donde concebir el conocimiento y la forma de producirlo, el contenido y desarrollo de la tesis es una responsabilidad que recae principalmente en el Tesista y el Director de tesis, son ellos quienes en última instancia definen los alcances, técnicas y metodologías adecuadas considerando el objeto de estudio que se pretende abordar, así como el grado académico al que se aspir',
    url: 'https://www.lasallevictoria.edu.mx/descargas/alumnos/Manual_de_Tesis_y_Trabajos_de_Inv.pdf',
    publicadorId: '34425123',
    facultadId: 'ACE',
  },
];

const prisma = new PrismaClient();

let userIdCounter = 0;
const createdUsers = [];

export async function createRandomUser() {
  const nombre = faker.person.firstName();
  const apellido = faker.person.lastName();
  userIdCounter++;

  return {
    id: userIdCounter.toString(),
    email: faker.internet
      .email({
        firstName: nombre,
        lastName: apellido,
        provider: 'gmail.com',
      })
      .toLowerCase(),
    passwd: await argon.hash('passwd'),
    nombre: nombre,
    apellido: apellido,
    role: [Role.DOCENTE],
    facultadId: faker.helpers.arrayElement(facultades).codigoFacultad,
  };
}

export async function createRandomPublication(
  id: string,
  prisma: PrismaClient,
) {
  const user = await prisma.user.findUnique({ where: { id } });
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    titulo: faker.lorem.words(),
    autor: [`${firstName} ${lastName}`],
    descripcion: faker.lorem.paragraph(),
    url: faker.internet.url(),
    publicadorId: id,
    // Usar el facultadId del usuario que publica la publicación
    facultadId: user.facultadId,
  };
}

async function main(prisma: PrismaClient) {
  // clean db
  await prisma.$transaction([
    prisma.publicacion.deleteMany(),
    prisma.user.deleteMany(),
    prisma.facultad.deleteMany(),
  ]);

  // CREATE facultades
  for (const fac of facultades) {
    await prisma.facultad.create({
      data: {
        codigoFacultad: fac.codigoFacultad,
        nombreFacultad: fac.nombreFacultad,
      },
    });
  }

  // CREATE admin
  const { role, ..._data } = users[0];

  const hashedPasswd = await argon.hash(users[0].passwd);

  const adminUser = await prisma.user.create({
    data: {
      ..._data,
      passwd: hashedPasswd,
      role: role.map((roleString) => Role[roleString]),
    },
  });

  // Insertar el usuario administrador en la primera posición del array
  createdUsers.unshift(adminUser);

  // CREATE users
  // const createdUsers = [];
  for (let i = 0; i < 50; ++i) {
    const userData = await createRandomUser();

    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

  // CREATE publicaciones
  for (let j = 0; j < 100; j++) {
    const post = await createRandomPublication(
      createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      prisma, // Pasar la instancia de PrismaClient como segundo argumento
    );
    await prisma.publicacion.create({
      data: post,
    });
  }
}

main(prisma);
