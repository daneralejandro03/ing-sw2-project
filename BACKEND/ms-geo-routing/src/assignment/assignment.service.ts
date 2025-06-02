import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentResponse } from './interface/AssignmentResponse.interface';

@Injectable()
export class AssignmentService {
  private readonly baseUrl: string;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const base = this.config.get<string>('MS_ORDERS_URL');
    if (!base) {
      throw new Error('MS_ORDERS_URL no está definida en la configuración');
    }
    // this.baseUrl ya debería incluir el path base como /api/v1/ si así lo tienes en el .env
    this.baseUrl = base.endsWith('/') ? base : base + '/';
  }

  async create(
    createAssignmentDto: CreateAssignmentDto,
    token: string,
  ): Promise<AssignmentResponse> {
    const { orderId, userDeliveryDriver, ...bodyPayload } = createAssignmentDto;

    if (!orderId || !userDeliveryDriver) {
      throw new BadRequestException('orderId y userDeliveryDriver son requeridos para crear la asignación.');
    }

    // La URL para crear asignaciones es: {baseUrl}/assignments/order/{orderId}/DeliveryDriver/{userDeliveryDriver}
    // Si this.baseUrl es "http://localhost:3003/api/v1/", entonces la URL se forma correctamente.
    const url = `${this.baseUrl}assignments/order/${encodeURIComponent(orderId)}/DeliveryDriver/${encodeURIComponent(userDeliveryDriver)}`;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const postObs: Observable<AxiosResponse<AssignmentResponse>> =
        this.http.post<AssignmentResponse>(url, bodyPayload, { headers });
      const resp = await firstValueFrom(postObs);

      // Manejo de respuesta 201 con cuerpo vacío {} según la API de ms-orders
      if (resp.status === 201 && resp.data && Object.keys(resp.data).length === 0) {
        let newAssignmentId = null;
        // Intentar obtener el ID del header Location
        if (resp.headers && resp.headers.location) {
          const locationParts = resp.headers.location.split('/');
          newAssignmentId = locationParts[locationParts.length - 1];
        }

        // Si no se pudo obtener un ID y es crítico, podrías lanzar un error o manejarlo.
        // Por ahora, construimos una respuesta lo mejor posible.
        return {
          id: newAssignmentId || 'ID_NO_DISPONIBLE_EN_RESPUESTA', // Opcional: manejar si el ID no viene
          orderId: orderId,
          userDeliveryDriver: userDeliveryDriver,
          status: bodyPayload.status || "assigned",
          note: bodyPayload.note,
          date: bodyPayload.date || new Date().toISOString(),
        } as AssignmentResponse;
      }
      return resp.data;

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        const responseData = axiosErr.response?.data as any; // Para acceder a mensajes de error

        console.error(`Error desde ms-Orders (status ${status}) al crear asignación:`, responseData);

        if (status === 400) {
          const errorMessage = responseData?.message || 'Datos inválidos al crear assignment en ms-Orders.';
          throw new BadRequestException(errorMessage);
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado al intentar crear assignment en ms-Orders.');
        }
        if (status === 404) { // Si ms-orders devuelve 404 (ej. orderId o userDeliveryDriver no existen)
          const errorMessage = responseData?.message || `Recurso no encontrado en ms-Orders al crear asignación (orderId: ${orderId}, driverId: ${userDeliveryDriver}).`;
          throw new NotFoundException(errorMessage);
        }
        // Otro error de Axios no manejado específicamente
        const defaultErrorMessage = responseData?.message || `Error (${status}) creando assignment en ms-Orders.`;
        throw new InternalServerErrorException(defaultErrorMessage);
      }
      // Error genérico
      console.error('Error desconocido creando assignment en ms-Orders:', err);
      throw new InternalServerErrorException('Error creando assignment en ms-Orders.');
    }
  }

  async findAll(token: string): Promise<AssignmentResponse[]> {
    // Asumiendo que este endpoint en ms-orders es {baseUrl}/assignments (plural)
    const url = `${this.baseUrl}assignments`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const getObs: Observable<AxiosResponse<AssignmentResponse[]>> =
        this.http.get<AssignmentResponse[]>(url, { headers });
      const resp = await firstValueFrom(getObs);
      return resp.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado');
        }
      }
      throw new InternalServerErrorException(
        'Error obteniendo assignments de ms-Orders',
      );
    }
  }

  async findOne(id: string, token: string): Promise<AssignmentResponse> {
    // Asumiendo que este endpoint en ms-orders es {baseUrl}/assignments/{id} (plural)
    const url = `${this.baseUrl}assignments/${encodeURIComponent(id)}`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const getObs: Observable<AxiosResponse<AssignmentResponse>> =
        this.http.get<AssignmentResponse>(url, { headers });
      const resp = await firstValueFrom(getObs);
      return resp.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        if (status === 404) {
          throw new NotFoundException(
            `Assignment #${id} no encontrado en ms-Orders`,
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado');
        }
      }
      throw new InternalServerErrorException(
        `Error obteniendo el assignment #${id} de ms-Orders`,
      );
    }
  }

  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
    token: string,
  ): Promise<AssignmentResponse> {
    // Asumiendo que este endpoint en ms-orders es {baseUrl}/assignments/{id} (plural)
    const url = `${this.baseUrl}assignments/${encodeURIComponent(id)}`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const patchObs: Observable<AxiosResponse<AssignmentResponse>> =
        this.http.patch<AssignmentResponse>(url, updateAssignmentDto, { headers });
      const resp = await firstValueFrom(patchObs);
      return resp.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        const responseData = axiosErr.response?.data as any;
        if (status === 400) {
          throw new BadRequestException(responseData?.message || 'Datos inválidos al actualizar assignment');
        }
        if (status === 404) {
          throw new NotFoundException(
            responseData?.message || `Assignment #${id} no encontrado en ms-Orders`,
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado');
        }
      }
      throw new InternalServerErrorException(
        `Error actualizando el assignment #${id} en ms-Orders`,
      );
    }
  }

  async remove(id: string, token: string): Promise<void> {
    // Asumiendo que este endpoint en ms-orders es {baseUrl}/assignments/{id} (plural)
    const url = `${this.baseUrl}assignments/${encodeURIComponent(id)}`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const deleteObs: Observable<AxiosResponse<void>> =
        this.http.delete<void>(url, { headers });
      await firstValueFrom(deleteObs);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        const responseData = axiosErr.response?.data as any;
        if (status === 404) {
          throw new NotFoundException(
            responseData?.message || `Assignment #${id} no encontrado en ms-Orders`,
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado');
        }
      }
      throw new InternalServerErrorException(
        `Error eliminando el assignment #${id} en ms-Orders`,
      );
    }
  }
}