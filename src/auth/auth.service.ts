import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        private readonly jwtService: JwtService
    ) { }

    // Registro de usuario
    async register(userData: Partial<Usuario>): Promise<Usuario> {
        try {
            console.log("Datos recibidos en el registro:", userData);

            const { email, username, password_hash } = userData;

            // Verificar si el usuario ya existe
            const existingUser = await this.usuarioRepository.findOne({ where: [{ email }, { username }] });
            if (existingUser) {
                throw new ConflictException('El correo o el usuario ya están registrados.');
            }

            // Hashear la contraseña
            if (!password_hash) {
                throw new Error('La contraseña no puede estar vacía.');
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

            const newUser = this.usuarioRepository.create({
                ...userData,
                password_hash: hashedPassword,  // ✅ Guardar la contraseña encriptada
            });

            return await this.usuarioRepository.save(newUser);
        } catch (error) {
            console.error('❌ Error en el registro:', error);
            throw new InternalServerErrorException('Error al registrar usuario.');
        }
    }

    // Login de usuario
    async login(email: string, password: string) {
        const user = await this.usuarioRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas.');
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas.');
        }

        // Generar token JWT
        const payload = { sub: user.usuario_k, email: user.email, role: user.rol_ENUM };
        const token = this.jwtService.sign(payload);

        return { access_token: token, user };
    }
}
