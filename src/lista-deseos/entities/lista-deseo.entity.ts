// src/lista-deseos/entities/lista-deseos.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Producto } from 'src/productos/entities/productos.entity'; 

@Entity()
export class ListaDeseos {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, usuario => usuario.listaDeseos, { eager: true })
  usuario: Usuario;

  @ManyToOne(() => Producto, producto => producto.listaDeseos, { eager: true })
  producto: Producto;

  @CreateDateColumn()
  fechaAgregado: Date;
}
