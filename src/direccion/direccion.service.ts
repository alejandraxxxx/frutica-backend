import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Direccion } from './entities/direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; // Asegúrate de tener esta entidad importada

@Injectable()
export class DireccionesService {
    constructor(
        @InjectRepository(Direccion)
        private readonly direccionRepository: Repository<Direccion>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Crea una nueva dirección para un usuario
     * - Autocompleta municipio y estado (COPOMEX)
     * - Genera coordenadas y URL (Google Maps)
     */
    async create(createDireccionDto: CreateDireccionDto, userId: number) {
      const nuevaDireccion = new Direccion();
      Object.assign(nuevaDireccion, createDireccionDto);
    
      // Buscar usuario real
      const usuario = await this.usuarioRepository.findOne({
        where: { usuario_k: userId },
      });
    
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }
    
      nuevaDireccion.usuario = usuario;
    
      // Marcar como pública si es admin
      nuevaDireccion.es_publica = usuario.role === 'admin';
    
      // Marcar como predeterminada si es la primera
      const totalDirecciones = await this.direccionRepository.count({
        where: { usuario: { usuario_k: userId } },
      });
      nuevaDireccion.es_predeterminada = totalDirecciones === 0;
    
      // COPOMEX y Google Maps
      const { estado, municipio } = await this.obtenerMunicipioYEstado(createDireccionDto.cp);
      nuevaDireccion.estado = estado;
      nuevaDireccion.municipio = municipio;

      //Verifica que pertenezca al estado de oaxaca
      if (estado.toLowerCase() !== 'oaxaca') {
        throw new BadRequestException('Solo entregamos dentro del estado de Oaxaca');
      }
    
      const datosParaGeocodificar = {
        calle: nuevaDireccion.calle,
        colonia: nuevaDireccion.colonia,
        cp: nuevaDireccion.cp,
        municipio: nuevaDireccion.municipio,
        estado: nuevaDireccion.estado,
        pais: nuevaDireccion.pais,
      };
    
      const { latitud, longitud, maps_url } = await this.obtenerUbicacionDesdeGoogle(datosParaGeocodificar);
      nuevaDireccion.latitud = latitud;
      nuevaDireccion.longitud = longitud;
      nuevaDireccion.maps_url = maps_url;
    
      return await this.direccionRepository.save(nuevaDireccion);
    }
    
      

    async findAll() {
        return await this.direccionRepository.find();
    }

    async findOne(id: number) {
        const direccion = await this.direccionRepository.findOne({ where: { direccion_k: id } });
        if (!direccion) throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        return direccion;
    }

    async update1(id: number, updateDireccionDto: Partial<CreateDireccionDto>) {
        const direccionExistente = await this.findOne(id);

        if (!direccionExistente) {
            throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        }

        Object.assign(direccionExistente, updateDireccionDto);

        if (updateDireccionDto.cp) {
            const { estado, municipio } = await this.obtenerMunicipioYEstado(updateDireccionDto.cp);
            direccionExistente.estado = estado;
            direccionExistente.municipio = municipio;
        }

        if (
            updateDireccionDto.calle || updateDireccionDto.colonia ||
            updateDireccionDto.cp || updateDireccionDto.municipio ||
            updateDireccionDto.estado || updateDireccionDto.pais
        ) {
            const datosParaGeocodificar = {
                calle: direccionExistente.calle,
                colonia: direccionExistente.colonia,
                cp: direccionExistente.cp,
                municipio: direccionExistente.municipio,
                estado: direccionExistente.estado,
                pais: direccionExistente.pais,
                ...updateDireccionDto,
            };

            const { latitud, longitud, maps_url } = await this.obtenerUbicacionDesdeGoogle(datosParaGeocodificar);
            direccionExistente.latitud = latitud;
            direccionExistente.longitud = longitud;
            direccionExistente.maps_url = maps_url;
        }
        
        return await this.direccionRepository.save(direccionExistente);
        
    }

    async remove1(id: number) {
        const result = await this.direccionRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        return { message: 'Dirección eliminada correctamente' };
    }

        private async obtenerMunicipioYEstado(cp: string) {
          const apiKey = this.configService.get<string>('COPOMEX_API_KEY');
          const url = `https://api.copomex.com/query/info_cp/${cp}?token=${apiKey}`;
          try {
            const response = await axios.get(url);
            if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
              throw new Error('Código postal no encontrado en COPOMEX');
            }
            const firstResult = response.data.find((res) => res.response && res.response.municipio && res.response.estado);
            if (!firstResult) {
              throw new Error('No se encontraron datos válidos en COPOMEX');
            }
            return {
              estado: firstResult.response.estado,
              municipio: firstResult.response.municipio,
            };
          } catch (error) {
            console.warn("Error en la API de COPOMEX:", error.response?.data || error.message);  
          }
        }
        

    private async obtenerUbicacionDesdeGoogle(dto: Partial<CreateDireccionDto>) {
        const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
        if (!dto.municipio || !dto.estado) {
            throw new Error('La dirección está incompleta: falta municipio o estado.');
        }
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    key: apiKey,
                    components: `locality:${dto.municipio}|administrative_area:${dto.estado}|country:MX`
                },
            });
            if (!response.data.results || response.data.results.length === 0) {
                throw new Error('No se encontró la ubicación en Google Maps.');
            }
            const location = response.data.results[0].geometry.location;
            return {
                latitud: location.lat.toFixed(6),
                longitud: location.lng.toFixed(6),
                maps_url: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
            };
        } catch (error) {
            console.error("Error en Google Maps API:", error.response?.data || error.message);
            throw new Error('Error obteniendo la ubicación de Google Maps');
        }
    }

    async findByUsuario(userId: number) {
        const usuario = await this.usuarioRepository.findOne({
          where: { usuario_k: userId },
          relations: ['direcciones'],
        });
      
        if (!usuario) {
          throw new NotFoundException('Usuario no encontrado');
        }
      
        return await this.direccionRepository.find({
          where: { usuario: { usuario_k: userId } },
          order: { fecha_actualizacion: 'DESC' },
        });
      }
      
      async update(id: number, dto: Partial<CreateDireccionDto>, userId: number) {
        const direccion = await this.direccionRepository.findOne({
          where: { direccion_k: id },
          relations: ['usuario'],
        });
      
        if (!direccion) {
          throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        }
      
        if (direccion.usuario.usuario_k !== userId) {
          throw new ForbiddenException('No puedes modificar una dirección que no te pertenece');
        }
      
        // Actualizar datos generales
        Object.assign(direccion, dto);
      
        // Si se actualiza el código postal, recuperamos municipio y estado
        if (dto.cp) {
          const { estado, municipio } = await this.obtenerMunicipioYEstado(dto.cp);
          direccion.estado = estado;
          direccion.municipio = municipio;
        }
      
        // Si el usuario movió el cursor del mapa
        if (
          dto.latitud &&
          dto.longitud &&
          (dto.latitud !== direccion.latitud || dto.longitud !== direccion.longitud)
        ) {
          direccion.latitud = dto.latitud;
          direccion.longitud = dto.longitud;
          direccion.maps_url = `https://www.google.com/maps?q=${dto.latitud},${dto.longitud}`;
        } else if (
          dto.calle || dto.colonia || dto.cp ||
          dto.municipio || dto.estado || dto.pais
        ) {
          // Si cambió dirección textual pero no se usó el mapa
          const datosParaGeocodificar = {
            calle: direccion.calle,
            colonia: direccion.colonia,
            cp: direccion.cp,
            municipio: direccion.municipio,
            estado: direccion.estado,
            pais: direccion.pais,
            ...dto,
          };
      
          const { latitud, longitud, maps_url } = await this.obtenerUbicacionDesdeGoogle(datosParaGeocodificar);
          direccion.latitud = latitud;
          direccion.longitud = longitud;
          direccion.maps_url = maps_url;
        }
      
        return await this.direccionRepository.save(direccion);
      }
      
      
      async remove(id: number, userId: number) {
        const direccion = await this.direccionRepository.findOne({
          where: { direccion_k: id },
          relations: ['usuario'],
        });
      
        if (!direccion) {
          throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        }
      
        if (direccion.usuario.usuario_k !== userId) {
          throw new Error('No tienes permisos para eliminar esta dirección');
        }
      
        const direccionesDelUsuario = await this.direccionRepository.find({
          where: { usuario: { usuario_k: userId } },
        });
      
        if (direccionesDelUsuario.length <= 1) {
          throw new Error('No puedes eliminar la única dirección registrada');
        }
      
        if (direccion.es_predeterminada) {
          const tieneOtraDireccion = direccionesDelUsuario.some(d => d.direccion_k !== direccion.direccion_k);
          if (!tieneOtraDireccion) {
            throw new Error('No puedes eliminar la dirección predeterminada si no tienes otra');
          }
      
          // Marcar otra dirección como predeterminada automáticamente
          const nuevaPredeterminada = direccionesDelUsuario.find(d => d.direccion_k !== direccion.direccion_k);
          if (nuevaPredeterminada) {
            nuevaPredeterminada.es_predeterminada = true;
            await this.direccionRepository.save(nuevaPredeterminada);
          }
        }
      
        await this.direccionRepository.delete(id);
        return { message: 'Dirección eliminada correctamente' };
      }
      

      async marcarComoPredeterminada(id: number, userId: number) {
        const direccion = await this.direccionRepository.findOne({
          where: { direccion_k: id },
          relations: ['usuario'], 
        });
      
        console.log(' Dirección encontrada:', direccion);
      
        if (!direccion) {
          throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        }
      
        console.log(' Relación usuario:', direccion.usuario);
      
        if (!direccion.usuario) {
          throw new Error('Esta dirección no tiene usuario asociado');
        }
      
        if (direccion.usuario.usuario_k !== userId) {
          throw new ForbiddenException('No puedes modificar una dirección que no te pertenece');
        }
        // Desmarcar otras direcciones predeterminadas del mismo usuario
        await this.direccionRepository
          .createQueryBuilder('direccion')
          .update()
          .set({ es_predeterminada: false })
          .where('usuarioUsuarioK = :userId', { userId })
          .execute();
      
        direccion.es_predeterminada = true;
        return await this.direccionRepository.save(direccion);
      }
      
      
      async obtenerPredeterminada(userId: number) {
        const direccion = await this.direccionRepository.findOne({
          where: {
            usuario: { usuario_k: userId },
            es_predeterminada: true,
          },
        });
      
        if (!direccion) {
          throw new NotFoundException('No se encontró una dirección predeterminada para este usuario');
        }
      
        return direccion;
      }

      async findPublicas() {
        return this.direccionRepository.find({
          where: {
            es_publica: true,
            activo: true,
          },
          order: { fecha_actualizacion: 'DESC' },
        });
      }
      
      async findPublicasPorMunicipio(municipio: string) {
        return this.direccionRepository.find({
          where: {
            es_publica: true,
            municipio: ILike(`%${municipio}%`), // búsqueda flexible
            activo: true,
          },
          order: { fecha_actualizacion: 'DESC' },
        });
      }
      
    }
