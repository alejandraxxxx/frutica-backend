import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { CarritoItem } from "src/carrito-item/entities/carrito-item.entity";

@Entity()
export class Carrito {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Usuario, usuario => usuario.carrito)
    usuario: Usuario;
    
    @OneToMany(() => CarritoItem, item => item.carrito, { cascade: true })
    items: CarritoItem[];
}
