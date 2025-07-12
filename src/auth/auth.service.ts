import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { JwtService } from '@nestjs/jwt';
import { admin } from 'src/config/firebase.config';
import { Usuario, UserRole } from 'src/usuarios/entities/usuario.entity';
import { ForbiddenException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { randomBytes } from 'crypto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Credencial)
        private readonly credencialRepository: Repository<Credencial>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    // ✅ Login con credenciales normales

    async login(email: string, password: string) {
        const userCredencial = await this.credencialRepository.findOne({
            where: { email },
            relations: ['usuario']
        });

        if (!userCredencial || !userCredencial.usuario) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        //bloqueo de cuenta no esta activa
        if (!userCredencial.usuario.user_verificado) {
            throw new ForbiddenException('Tu cuenta no está activa. Contacta al soporte.');
        }

        const passwordMatch = await bcrypt.compare(password, userCredencial.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const firebaseToken = await admin.auth().createCustomToken(email);

        const jwtToken = this.jwtService.sign(
            {
                email,
                sub: userCredencial.usuario.usuario_k,
                role: userCredencial.usuario.role,
            },
            { expiresIn: '8h' }
        );

        userCredencial.token = firebaseToken;
        await this.credencialRepository.save(userCredencial);

        return {
            message: 'Login exitoso',
            firebaseToken,
            jwtToken,
            role: userCredencial.usuario.role,
        };
    }

    // ✅ Login con Google basado en ID Token de Firebase

    async loginWithGoogle(idToken: string) {
        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            const email = decoded.email;
            const nombre = decoded.name ?? (email ? email.split('@')[0] : 'Sin nombre');


            if (!email) {
                throw new UnauthorizedException('El token de Google no contiene un correo válido');
            }

            let credencial = await this.credencialRepository.findOne({
                where: { email },
                relations: ['usuario'],
            });

            // ⛔ Bloqueado si existe y no verificado
            if (credencial?.usuario && !credencial.usuario.user_verificado) {
                throw new ForbiddenException('Tu cuenta no está activa. Contacta al soporte.');
            }
            let esNuevo = false;

            if (!credencial) {
                esNuevo = true;
                //Crear usuario + credencial si no existe
                const nuevoUsuario = this.usuarioRepository.create({
                    nombre,
                    sexo: 'Otro' as any,
                    login_google: true,
                    role: UserRole.USER,
                    estado_ENUM: 'activo' as any,
                    registrado_desde: 'google',
                    pago_habitual: false,
                    entrega_habitual: false,
                    user_verificado: true,
                });
                // ✅ password_hash “dummy” para cumplir NOT NULL
                const dummy = randomBytes(32).toString('hex');         
                const password_hash = await bcrypt.hash(dummy, 10);

                const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

                credencial = this.credencialRepository.create({
                    email,
                    usuario: usuarioGuardado,
                    password_hash,
                    token: '',
                });

                credencial = await this.credencialRepository.save(credencial);
            }

            const jwtToken = await this.jwtService.signAsync(
                {
                    email,
                    sub: credencial.usuario.usuario_k,
                    role: credencial.usuario.role,
                },
                { expiresIn: '8h' },
            );
            //envía bienvenida
            if (esNuevo) {
                this.emailService.enviarBienvenida(email, nombre)
                    .catch(err => console.error('No se pudo enviar correo de bienvenida:', err));
            }
            return {
                message: 'Login con Google exitoso',
                jwtToken,
                user: credencial.usuario,
            };
        } catch (error) {
            console.error('❌ Error loginWithGoogle:', error);
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Error al iniciar sesión con Google');
        }
    }



    //Verificar y decodificar un token JWT
    async validateToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    //Verificar si un usuario es Admin
    async isAdmin(userId: number): Promise<boolean> {
        const user = await this.usuarioRepository.findOne({ where: { usuario_k: userId } });
        return user?.role === UserRole.ADMIN;
    }
}
