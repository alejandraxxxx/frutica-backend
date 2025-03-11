import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direccion } from './entities/direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DireccionesService {
    constructor(
        @InjectRepository(Direccion)
        private readonly direccionRepository: Repository<Direccion>,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Crea una nueva dirección con:
     * - Autocompletado de municipio y estado (API COPOMEX)
     * - Obtención de coordenadas (Google Maps)
     */
    async create(createDireccionDto: CreateDireccionDto) {
      // Crear instancia de la entidad
      const nuevaDireccion = new Direccion();
      Object.assign(nuevaDireccion, createDireccionDto);
      
      // Obtener municipio y estado desde COPOMEX
      const { estado, municipio } = await this.obtenerMunicipioYEstado(createDireccionDto.cp);
      nuevaDireccion.estado = estado;
      nuevaDireccion.ciudad = municipio;
  
      // PASAR LOS DATOS COMPLETOS A GOOGLE MAPS
      const datosParaGeocodificar = {
          calle: nuevaDireccion.calle,
          colonia: nuevaDireccion.colonia,
          cp: nuevaDireccion.cp,
          ciudad: nuevaDireccion.ciudad, // Ahora está garantizado que no es vacío
          estado: nuevaDireccion.estado, // Ya está definido
          pais: nuevaDireccion.pais,
      };
  
      // Obtener coordenadas y URL de Google Maps
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

    async update(id: number, updateDireccionDto: Partial<CreateDireccionDto>) {
        // Primero buscar la dirección existente
        const direccionExistente = await this.findOne(id);
        
        if (!direccionExistente) {
            throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        }
        
        // Actualizar los datos con el DTO
        Object.assign(direccionExistente, updateDireccionDto);
        
        // Si se actualiza el código postal, actualizar municipio y estado
        if (updateDireccionDto.cp) {
            const { estado, municipio } = await this.obtenerMunicipioYEstado(updateDireccionDto.cp);
            direccionExistente.estado = estado;
            direccionExistente.ciudad = municipio;
        }
        
        // Si se actualiza algún dato de ubicación, actualizar coordenadas
        if (updateDireccionDto.calle || updateDireccionDto.colonia || 
            updateDireccionDto.cp || updateDireccionDto.ciudad || 
            updateDireccionDto.estado || updateDireccionDto.pais) {
            
            // Crear DTO con datos actualizados para obtener ubicación
            const datosParaGeocodificar = {
                calle: direccionExistente.calle,
                colonia: direccionExistente.colonia,
                cp: direccionExistente.cp,
                ciudad: direccionExistente.ciudad,
                estado: direccionExistente.estado,
                pais: direccionExistente.pais,
                ...updateDireccionDto
            };
            
            const { latitud, longitud, maps_url } = await this.obtenerUbicacionDesdeGoogle(datosParaGeocodificar);
            direccionExistente.latitud = latitud;
            direccionExistente.longitud = longitud;
            direccionExistente.maps_url = maps_url;
        }
        
        return await this.direccionRepository.save(direccionExistente);
    }

    async remove(id: number) {
        const result = await this.direccionRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
        return { message: 'Dirección eliminada correctamente' };
    }

    /**
     * Obtener municipio y estado desde API COPOMEX
     */
    private async obtenerMunicipioYEstado(cp: string) {
      const apiKey = this.configService.get<string>('COPOMEX_API_KEY');
      const url = `https://api.copomex.com/query/info_cp/${cp}?token=${apiKey}`;
  
      try {
          console.log(`Consultando COPOMEX: ${url}`);
  
          const response = await axios.get(url);
          console.log("Respuesta de COPOMEX:", response.data);
  
          if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
              throw new Error('Código postal no encontrado en COPOMEX');
          }
  
          // Extraer la primera respuesta válida
          const firstResult = response.data.find((res) => res.response && res.response.municipio && res.response.estado);
  
          if (!firstResult) {
              throw new Error('No se encontraron datos válidos en COPOMEX');
          }
  
          return {
              estado: firstResult.response.estado,
              municipio: firstResult.response.municipio,
          };
      } catch (error) {
          console.error("Error en la API de COPOMEX:", error.response?.data || error.message);
          throw new Error('Error consultando la API de COPOMEX');
      }
  }
  
  
    /**
     * Obtener coordenadas y URL de Google Maps
     */
    private async obtenerUbicacionDesdeGoogle(dto: Partial<CreateDireccionDto>) {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  
      if (!dto.ciudad || !dto.estado) {
          throw new Error('La dirección está incompleta: falta ciudad o estado.');
      }
  
      try {
          console.log(`Consultando Google Maps con municipio y estado: ${dto.ciudad}, ${dto.estado}, ${dto.pais || 'México'}`);
  
          const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
              params: {
                  key: apiKey,
                  components: `locality:${dto.ciudad}|administrative_area:${dto.estado}|country:MX`
              },
          });
  
          console.log("Respuesta completa de Google Maps:", JSON.stringify(response.data, null, 2));
  
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
  
  
}