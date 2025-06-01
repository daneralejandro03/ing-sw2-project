import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse } from 'axios';

import { UserTokenDto } from './dto/user-token.dto';

export interface CreateUserResponse {
  message: string;
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class UserClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const base = this.config.get<string>('MS_SECURITY_URL');
    if (!base) {
      throw new Error('MS_SECURITY_URL is not defined in the configuration');
    }
    this.baseUrl = base.endsWith('/') ? base : base + '/';
  }

  private async requestGet<T>(
    path: string,
    token: string,
  ): Promise<AxiosResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    try {
      const obs: Observable<AxiosResponse<T>> = this.http.get<T>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await firstValueFrom(obs);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Re‐lanzar el AxiosError para manejar afuera
        throw err;
      }
      throw new InternalServerErrorException('Error al realizar GET');
    }
  }


  /**
   * findOne: trae únicamente {_id, email, estado, role}
   */
  async findOne(userId: string, token: string): Promise<UserTokenDto> {
    try {
      const resp = await this.requestGet<any>(
        `user/${encodeURIComponent(userId)}`,
        token,
      );

      // Aquí hacemos el mapeo “manual” para que solo retorne los 4 campos:
      const raw = resp.data;
      const out: UserTokenDto = {
        id: raw._id,
        email: raw.email,
        estado: raw.estado,
        role: raw.role, // Asegúrate de que viene como string (id del rol)
      };
      return out;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = (err as AxiosError).response?.status;
        if (status === 404) {
          throw new NotFoundException(
            `User #${userId} not found in Security Service`,
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      throw new InternalServerErrorException(
        'Error fetching user from Security Service',
      );
    }
  }

  /**
   * findByEmail: igual, solo devuelve {_id, email, estado, role}
   */
  async findByEmail(email: string, token: string): Promise<UserTokenDto> {
    try {
      const emailParam = encodeURIComponent(email);
      const resp = await this.requestGet<any>(
        `user/email/${emailParam}`,
        token,
      );
      const raw = resp.data;
      const out: UserTokenDto = {
        id: raw._id,
        email: raw.email,
        estado: raw.estado,
        role: raw.role,
      };
      return out;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = (err as AxiosError).response?.status;
        if (status === 404) {
          throw new NotFoundException(
            `User ${email} not found in Security Service`,
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      throw new InternalServerErrorException(
        'Error fetching user from Security Service',
      );
    }
  }


  async verifyUserExists(userId: string, token: string): Promise<void> {
    try {
      await this.requestGet<unknown>(`user/${encodeURIComponent(userId)}`, token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = (err as AxiosError).response?.status;
        if (status === 404) {
          throw new NotFoundException(
            `User #${userId} not found in Security Service`,
          );
        }
        if (status === 401) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      throw new InternalServerErrorException('Error contacting Security Service');
    }
  }

}
