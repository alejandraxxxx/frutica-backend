import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { JwtService } from '@nestjs/jwt';
import { admin } from 'src/config/firebase.config';
import { Usuario, UserRole } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Credencial)
        private readonly credencialRepository: Repository<Credencial>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly jwtService: JwtService,
    ) {}
 
    //  Login con credenciales normales
    async login(email: string, password: string) {
        // Buscar usuario en la tabla de credenciales
        const userCredencial = await this.credencialRepository.findOne({ 
            where: { email }, 
            relations: ['usuario'] 
        });

        if (!userCredencial || !userCredencial.usuario) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Comparar contraseñas
        const passwordMatch = await bcrypt.compare(password, userCredencial.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Obtener el rol del usuario
        const role = userCredencial.usuario.role;  

        // Generar token de Firebase
        const firebaseToken = await admin.auth().createCustomToken(email);
        
        // Generar token JWT local con rol
        const jwtToken = this.jwtService.sign({
            email,
            sub: userCredencial.usuario.usuario_k,
            role: userCredencial.usuario.role , 
        });

        // Guardar token en la base de datos
        userCredencial.token = firebaseToken;
        await this.credencialRepository.save(userCredencial);

        return {
            message: 'Login exitoso',
            firebaseToken,
            jwtToken,
            role, 
        };
    }

    // ✅ Login con Google basado en ID Token de Firebase
    async loginWithGoogle(idToken: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { email, name, picture } = decodedToken;

            let user = await this.usuarioRepository.findOne({ 
                where: { credenciales: { email } }, 
                relations: ['credenciales'] 
            });

            if (!user) {
                user = this.usuarioRepository.create({
                    nombre: name,
                    sexo: "Otro",
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
            }

            // Generar token JWT local
            const jwtToken = this.jwtService.sign({ 
                email, 
                sub: user.usuario_k, 
                role: user.role 
            });

            return {
                message: 'Login con Google exitoso',
                user,
                jwtToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido de Google');
        }
    }

    // Registro/Login con Google y almacenamiento en BD
    async handleGoogleLogin(userData: any) {
        const { email, nombre, apellido_paterno, apellido_materno, telefono, sexo } = userData;
        
        try {
            let user = await this.usuarioRepository.findOne({ 
                where: { credenciales: { email } }, 
                relations: ['credenciales'] 
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

                const credential = this.credencialRepository.create({
                    email,
                    usuario: user, 
                    password_hash: '', 
                });

                await this.credencialRepository.save(credential);
            } else {
                if (!user.login_google) {
                    user.login_google = true;
                    await this.usuarioRepository.save(user);
                }
            }

            return { message: 'Usuario autenticado con éxito', user };
        } catch (error) {
            throw new Error("No se pudo guardar el usuario en la base de datos.");
        }
    }

    // ✅ Verificar y decodificar un token JWT
    async validateToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    // ✅ Verificar si un usuario es Admin
    async isAdmin(userId: number): Promise<boolean> {
        const user = await this.usuarioRepository.findOne({ where: { usuario_k: userId } });
        return user?.role === UserRole.ADMIN;
    }
}
