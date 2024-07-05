import { CaslAbilityFactory, Action } from './casl-ability.factory';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from 'src/auth/types';
import { Publicacion } from 'src/publicaciones/entity/publicacion.entity';
import { User } from 'src/users/entities/user.entity';
import { subject } from '@casl/ability';

const testCaslAbilityFactory = () => {
  const caslAbilityFactory = new CaslAbilityFactory();

  // Mock user data
  const user: JwtPayload = {
    sub: '42',
    email: 'test.user@example.com',
    role: [Role.DOCENTE],
    facultadId: 'CS',
  };

  // Create ability for the user
  const ability = caslAbilityFactory.createForUser(user);

  // Mock publicacion data
  const publicacionOwn: Publicacion = {
    idPublicacion: '1',
    titulo: 'Test Publication',
    autor: ['Author 1'],
    descripcion: 'Description',
    url: 'http://example.com',
    publicadorId: '42',
    facultadId: 'CS',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const publicacionOther: Publicacion = {
    idPublicacion: '2',
    titulo: 'Another Test Publication',
    autor: ['Author 2'],
    descripcion: 'Description',
    url: 'http://example.com',
    publicadorId: '43',
    facultadId: 'CS',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Check if the user can update and delete their own publicacion
  console.log(
    'Can update own publication:',
    ability.can(Action.Update, subject('Publicacion', publicacionOwn)),
  ); // Should print: true
  console.log(
    'Can delete own publication:',
    ability.can(Action.Delete, subject('Publicacion', publicacionOwn)),
  ); // Should print: true

  // Check if the user cannot update and delete other users' publicacion
  console.log(
    'Can update other publication:',
    ability.cannot(Action.Update, subject('Publicacion', publicacionOther)),
  ); // Should print: true
  console.log(
    'Can delete other publication:',
    ability.cannot(Action.Delete, subject('Publicacion', publicacionOther)),
  ); // Should print: true

  // Check if the user cannot update other users
  const otherUser: User = {
    id: '43',
    email: 'other.user@example.com',
    passwd: 'password',
    nombre: 'Other',
    apellido: 'User',
    role: [Role.DOCENTE],
    facultadId: 'CS',
    hashedRt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log(
    'Can update other user:',
    ability.cannot(Action.Update, subject('User', otherUser)),
  ); // Should print: true
};

// Run the test
testCaslAbilityFactory();
