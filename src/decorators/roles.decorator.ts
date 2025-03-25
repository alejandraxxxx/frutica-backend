import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/usuarios/entities/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);