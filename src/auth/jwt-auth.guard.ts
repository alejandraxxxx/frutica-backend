// src/auth/jwt-auth.guard.ts
/* 
Este archivo activa el uso del JwtStrategy para proteger rutas.
Es el que se pone con @UseGuards(JwtAuthGuard).
*/

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
