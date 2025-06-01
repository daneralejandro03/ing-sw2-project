import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse } from 'axios';

interface RoleResponse {
  _id: string;
  name: string;
  // (otros campos los ignoramos)
}

@Injectable()
export class RoleClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const base = this.config.get<string>('MS_SECURITY_URL');
    if (!base) {
      throw new Error('MS_SECURITY_URL no configurada');
    }
    this.baseUrl = base.endsWith('/') ? base : base + '/';
  }

  /**
   * Obtiene un rol por su ID:
   * GET /api/v1/role/{roleId}
   * Devuelve solo { _id, name }.
   */
  async getRoleById(roleId: string, token: string): Promise<RoleResponse> {
    const url = `${this.baseUrl}role/${encodeURIComponent(roleId)}`;
    try {
      const obs: Observable<AxiosResponse<RoleResponse>> = this.http.get<RoleResponse>(
        url,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const resp = await firstValueFrom(obs);
      return {
        _id: resp.data._id,
        name: resp.data.name,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = (err as AxiosError).response?.status;
        if (status === 404) {
          throw new NotFoundException(`Rol #${roleId} no encontrado en Security Service`);
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado al consultar rol');
        }
      }
      throw new InternalServerErrorException('Error al obtener rol de Security Service');
    }
  }
}
