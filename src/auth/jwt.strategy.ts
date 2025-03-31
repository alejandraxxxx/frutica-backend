import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';
import { Credencial } from 'src/credenciales/entities/credencial.entity';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        @InjectRepository(Credencial)
        private credencialRepository: Repository<Credencial>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }


    async validate(payload: any) {
        console.log('🚀 JWT Payload recibido:', payload);

        const user = await this.usuarioRepository.findOne({
            where: { usuario_k: payload.sub },
        });

        console.log('👤 Usuario encontrado:', user);

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return {
            id: payload.sub,      
            email: payload.email,
            role: user?.role,
        };
    }

}
