import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { JwtService } from '@nestjs/jwt';
import { admin }  from '../config/firebase.config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Credencial)
        private readonly credencialRepository: Repository<Credencial>,
        private readonly jwtService: JwtService,
    ) { }

    //hash contraseña desde postman
    async hashPassword(password: string) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return { hashedPassword };
      }

    async login(email: string, password: string) {
        // Buscar usuario en la base de datos
        const userCredencial = await this.credencialRepository.findOne({
            where: { email },
        });

        if (!userCredencial) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Comparar contraseñas
        const passwordMatch = await bcrypt.compare(password, userCredencial.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Generar token de Firebase
        const firebaseToken = await admin.auth().createCustomToken(email);

        // Generar token JWT local
        const jwtToken = this.jwtService.sign({ email, credential_k: userCredencial.credential_k });

        // Guardar token en la base de datos
        userCredencial.token = firebaseToken;
        await this.credencialRepository.save(userCredencial);

        return {
            message: 'Login exitoso',
            firebaseToken,
            jwtToken,
        };
    }
}
