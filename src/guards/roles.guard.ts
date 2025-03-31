import {CanActivate,ExecutionContext, Injectable, ForbiddenException,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // Obtener roles requeridos desde el decorador @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si el endpoint no requiere roles, permitir acceso
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Validar existencia de usuario y su rol
        if (!user || !user.role) {
            throw new ForbiddenException('No se encontró información del usuario o su rol.');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                `No tienes permisos para realizar esta acción. Se requiere el rol: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}
