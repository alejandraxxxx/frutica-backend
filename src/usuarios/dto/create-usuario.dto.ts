import { IsString, IsEmail, IsOptional, IsInt, IsBoolean, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @MaxLength(45)
    apellido_paterno: string;


    @IsString()
    @MaxLength(10)
    sexo: string;


    @IsOptional()
    @IsString()
    @MaxLength(45)
    apellido_materno?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    telefono?: string;

    @IsEmail()
    correo_electronico: string;

    @IsOptional()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/, {
        message: 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número',
    })
    contrasena?: string;

    @IsOptional()
    @IsNotEmpty()
    contrasenaRepetida?: string;

    @IsOptional()
    @IsBoolean()
    login_facebook?: boolean;

    @IsOptional()
    @IsBoolean()
    login_google?: boolean;

    @IsOptional()
    @IsBoolean()
    login_normal?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    rol_ENUM?: string;


    @IsOptional()
    @IsString()
    @MaxLength(45)
    estado_ENUM?: string;


    @IsOptional()
    @IsString()
    @MaxLength(15)
    registrado_desde?: string;

    @IsOptional()
    @IsBoolean()
    pago_habitual?: boolean;

    @IsOptional()
    @IsBoolean()
    entrega_habitual?: boolean;

    @IsOptional()
    @IsBoolean()
    user_verificado?: boolean;
}
