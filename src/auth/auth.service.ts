import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { JwtService } from '@nestjs/jwt';
import { admin } from 'src/config/firebase.config';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Credencial)
        private readonly credencialRepository: Repository<Credencial>,
        private readonly jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        // 1️⃣ Buscar usuario en la tabla de credenciales
        const userCredencial = await this.credencialRepository.findOne({ where: { email } });

        if (!userCredencial) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // 2️⃣ Comparar contraseñas
        const passwordMatch = await bcrypt.compare(password, userCredencial.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // 3️⃣ Generar token de Firebase
        const firebaseToken = await admin.auth().createCustomToken(email);
        
        // 4️⃣ Generar token JWT local
        const jwtToken = this.jwtService.sign({ email, credential_k: userCredencial.credential_k });

        // 5️⃣ Guardar token en la base de datos
        userCredencial.token = firebaseToken;
        await this.credencialRepository.save(userCredencial);

        return {
            message: 'Login exitoso',
            firebaseToken,
            jwtToken,
        };
    }
}