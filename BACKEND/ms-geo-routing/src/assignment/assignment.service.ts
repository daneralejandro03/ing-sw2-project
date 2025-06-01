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
      throw new Error('MS_ORDERS_URL is not defined in configuration');
    }
    this.baseUrl = base.endsWith('/') ? base : base + '/';
  }


  async create(
    createAssignmentDto: CreateAssignmentDto,
    token: string,
  ): Promise<AssignmentResponse> {
    const url = `${this.baseUrl}assignment`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const postObs: Observable<AxiosResponse<AssignmentResponse>> =
        this.http.post<AssignmentResponse>(url, createAssignmentDto, { headers });
      const resp = await firstValueFrom(postObs);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        if (status === 400) {
          throw new BadRequestException(
            'Datos inválidos al crear assignment',
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado');
        }
      }
      throw new InternalServerErrorException(
        'Error creando assignment en ms-Orders',
      );
    }
  }


  async findAll(token: string): Promise<AssignmentResponse[]> {
    const url = `${this.baseUrl}assignment`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const getObs: Observable<AxiosResponse<AssignmentResponse[]>> =
        this.http.get<AssignmentResponse[]>(url, { headers });
      const resp = await firstValueFrom(getObs);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error && (err as AxiosError).isAxiosError) {
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
    const url = `${this.baseUrl}assignment/${encodeURIComponent(id)}`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const getObs: Observable<AxiosResponse<AssignmentResponse>> =
        this.http.get<AssignmentResponse>(url, { headers });
      const resp = await firstValueFrom(getObs);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error && (err as AxiosError).isAxiosError) {
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
    const url = `${this.baseUrl}assignment/${encodeURIComponent(id)}`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const patchObs: Observable<AxiosResponse<AssignmentResponse>> =
        this.http.patch<AssignmentResponse>(url, updateAssignmentDto, { headers });
      const resp = await firstValueFrom(patchObs);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        if (status === 400) {
          throw new BadRequestException('Datos inválidos al actualizar assignment');
        }
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
        `Error actualizando el assignment #${id} en ms-Orders`,
      );
    }
  }


  async remove(id: string, token: string): Promise<void> {
    const url = `${this.baseUrl}assignment/${encodeURIComponent(id)}`;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const deleteObs: Observable<AxiosResponse<void>> =
        this.http.delete<void>(url, { headers });
      await firstValueFrom(deleteObs);
    } catch (err: unknown) {
      if (err instanceof Error && (err as AxiosError).isAxiosError) {
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
        `Error eliminando el assignment #${id} en ms-Orders`,
      );
    }
  }
}
