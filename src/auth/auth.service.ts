import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { JwtService } from '@nestjs/jwt';
import { admin } from 'src/config/firebase.config';
import { Usuario, UserRole } from 'src/usuarios/entities/usuario.entity';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Credencial)
        private readonly credencialRepository: Repository<Credencial>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly jwtService: JwtService,
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
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { email, name } = decodedToken;

            if (!email) {
                throw new UnauthorizedException('El token de Google no contiene un correo válido');
            }

            // Buscar credencial y usuario
            let credencial = await this.credencialRepository.findOne({
                where: { email },
                relations: ['usuario'],
            });

            // ⛔ Si ya existe y está desactivado: bloquear
            if (credencial?.usuario && !credencial.usuario.user_verificado) {
                throw new ForbiddenException('Tu cuenta no está activa. Contacta al soporte.');
            }

            if (!credencial) {
                // Crear usuario
                const nuevoUsuario = this.usuarioRepository.create({
                    nombre: name || 'Sin nombre',
                    sexo: 'Otro',
                    login_google: true,
                    role: UserRole.USER,
                    estado_ENUM: 'activo',
                    registrado_desde: 'google',
                    pago_habitual: false,
                    entrega_habitual: false,
                    user_verificado: true,
                });

                const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

                // Crear credencial
                credencial = this.credencialRepository.create({
                    email,
                    usuario: usuarioGuardado,
                    password_hash: '',
                });

                credencial = await this.credencialRepository.save(credencial);
            }

            // Ahora sí: generar JWT local (8 horas)
            const jwtToken = this.jwtService.sign(
                {
                    email,
                    sub: credencial.usuario.usuario_k,
                    role: credencial.usuario.role,
                },
                { expiresIn: '8h' }
            );

            //También generar token de Firebase (opcional)
            const firebaseToken = await admin.auth().createCustomToken(email);

            //Guardar el token generado en la credencial
            credencial.token = jwtToken;
            await this.credencialRepository.save(credencial);

            return {
                message: 'Login con Google exitoso',
                jwtToken,
                firebaseToken,
            };
        } catch (error) {
            console.error('❌ Error loginWithGoogle:', error);
            // Si ya es Forbidden/Unauthorized, Nest respetará el status code
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Error al iniciar sesión con Google');
        }
    }


    //Registro/Login con Google (desde el registro normal)
    async handleGoogleLogin(userData: any) {
        const { email, nombre, apellido_paterno, apellido_materno, telefono, sexo } = userData;

        try {
            let user = await this.usuarioRepository.findOne({
                where: { credencial: { email } },
                relations: ['credencial']
            });

            if (!user) {
                user = this.usuarioRepository.create({
                    nombre,
                    apellido_paterno,
                    apellido_materno: apellido_materno || null,
                    telefono: telefono || null,
                    sexo,
                    login_google: true,
                    role: UserRole.USER,
                    estado_ENUM: 'activo',
                    registrado_desde: 'google',
                    pago_habitual: false,
                    entrega_habitual: false,
                    user_verificado: true,
                });

                user = await this.usuarioRepository.save(user);

                const credencial = this.credencialRepository.create({
                    email,
                    usuario: user,
                    password_hash: '',
                });

                await this.credencialRepository.save(credencial);
            } else {
                if (!user.login_google) {
                    user.login_google = true;
                    await this.usuarioRepository.save(user);
                }
            }

            return { message: 'Usuario autenticado con éxito', user };
        } catch (error) {
            throw new Error('No se pudo guardar el usuario en la base de datos.');
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
