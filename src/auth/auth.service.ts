import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { JwtService } from '@nestjs/jwt';
import { admin } from 'src/config/firebase.config';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
Usuario

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Credencial)
        private readonly credencialRepository: Repository<Credencial>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly jwtService: JwtService,
    ) { }

    //  Login con credenciales normales
    async login(email: string, password: string) {
        //  Buscar usuario en la tabla de credenciales
        const userCredencial = await this.credencialRepository.findOne({ where: { email } });

        if (!userCredencial) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        //  Comparar contraseñas
        const passwordMatch = await bcrypt.compare(password, userCredencial.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        //  Generar token de Firebase
        const firebaseToken = await admin.auth().createCustomToken(email);
        
        //  Generar token JWT local
        const jwtToken = this.jwtService.sign({ email, credential_k: userCredencial.credential_k });

        //  Guardar token en la base de datos
        userCredencial.token = firebaseToken;
        await this.credencialRepository.save(userCredencial);

        return {
            message: 'Login exitoso',
            firebaseToken,
            jwtToken,
        };
    }

    //  Login con Google (Método basado en el ID Token de Firebase)
    async loginWithGoogle(idToken: string) {
        try {
            //  Verificar el token de Google con Firebase
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { email, name, picture } = decodedToken;
    
            //  Buscar si el usuario ya existe en la base de datos (relacionado con la tabla credenciales)
            let user = await this.usuarioRepository.findOne({ where: { credenciales: { email } }, relations: ['credenciales'] });
    
            if (!user) {
                //  Si no existe, crearlo
                user = this.usuarioRepository.create({
                    nombre: name,
                    sexo: "Otro", // Si Google no proporciona el dato, asignar un valor por defecto
                    login_google: true,
                    rol_ENUM: 'cliente',
                    estado_ENUM: 'activo',
                    registrado_desde: 'google',
                    pago_habitual: false,
                    entrega_habitual: false,
                    user_verificado: true,
                });
    
                user = await this.usuarioRepository.save(user);
    
                //  Crear la credencial vinculada al usuario
                const credencial = this.credencialRepository.create({
                    email,
                    usuario: user,  // Relación con la tabla usuario
                    password_hash: '',  // Como es login con Google, no hay contraseña
                });
    
                await this.credencialRepository.save(credencial);
            }
    
            // Generar un token JWT local
            const jwtToken = this.jwtService.sign({ email, userId: user.usuario_k });
    
            return {
                message: 'Login con Google exitoso',
                user,
                jwtToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido de Google');
        }
    }
    // Registro/Login con Google (Método para recibir datos desde el frontend y almacenar en BD)
    async handleGoogleLogin(userData: any) {
        const { email, nombre, apellido_paterno, apellido_materno, telefono, sexo } = userData;
        
        try{
        let user = await this.usuarioRepository.findOne({ 
            where: { credenciales: { email } }, 
            relations: ['credenciales'] });
    
        if (!user) {
            // Crear nuevo usuario
            user = this.usuarioRepository.create({
                nombre,
                apellido_paterno,
                apellido_materno: apellido_materno || null,
                telefono: telefono || null,
                sexo,
                login_google: true,  // Marcar que el usuario se registró con Google
                rol_ENUM: 'cliente',
                estado_ENUM: 'activo',
                registrado_desde: 'google',
                pago_habitual: false,
                entrega_habitual: false,
                user_verificado: true, // Opcionalmente marcarlo como verificado
            });
    
            user = await this.usuarioRepository.save(user);
            console.log("✅ Usuario guardado en la BD:", user); 
    
            // Crear la credencial asociada
            const credential = this.credencialRepository.create({
                email,
                usuario: user,  // Relación con el usuario
                password_hash: '',  // No hay contraseña porque es Google
            });
    
            await this.credencialRepository.save(credential);
            console.log("✅ Credencial guardada en la BD:", credential);
        } else {
            // 🔹 Asegurar que el campo login_google esté en true si ya existe el usuario
            if (!user.login_google) {
                user.login_google = true;
                await this.usuarioRepository.save(user);
                console.log("✅ Usuario actualizado en la BD con login_google = true:", user);
            }
        }
    
        return { message: 'Usuario autenticado con éxito', user };
    } catch (error) {
        console.error("❌ ERROR al guardar el usuario en la BD:", error);
        throw new Error("No se pudo guardar el usuario en la base de datos.");
    }
    }
}