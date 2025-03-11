import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, OneToOne } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity()
@Unique(["email"])
export class Credencial {
    @PrimaryGeneratedColumn()
    credential_k: number;

    @Column({ length: 60, unique: true })
    email: string;


    @Column({ length: 255 })
    password_hash: string;

    @Column({ type: 'text', nullable: true })
    token: string;

    @CreateDateColumn()
    fecha_creacion: Date;

    @ManyToOne(() => Usuario, usuario => usuario.credencial)
    usuario: Usuario;
}