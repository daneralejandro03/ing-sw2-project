import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleClientService {
  private readonly baseUrl: string;
  constructor(private http: HttpService, private config: ConfigService) {
    const base = this.config.get<string>('SECURITY_SERVICE_URL');
    if (!base) throw new Error('SECURITY_SERVICE_URL no configurada');
    this.baseUrl = base.endsWith('/') ? base : base + '/';
  }

  async ensureRole(roleName: string, token: string): Promise<string> {
    try {
      const resp = await firstValueFrom(
        this.http.get<{ _id: string; name: string }[]>(
          `${this.baseUrl}role`,
          { headers: { Authorization: token } },
        ),
      );
      const found = resp.data.find(r => r.name === roleName);
      console.log('found', found?._id);
      if (found) return found._id;
    } catch {
      throw new InternalServerErrorException('Error al listar roles');
    }
    try {
      const resp = await firstValueFrom(
        this.http.post<{ id: string }>(
          `${this.baseUrl}role`,
          { name: roleName },
          { headers: { Authorization: token } },
        ),
      );
      return resp.data.id;
    } catch {
      throw new InternalServerErrorException('Error al crear rol');
    }
  }
}