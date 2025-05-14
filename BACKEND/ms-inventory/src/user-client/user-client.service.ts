import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { UserTokenDto } from './dto/user-token.dto';
import { CreateUserDto } from './dto/create-user.dto';

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
    const base = this.config.get<string>('SECURITY_SERVICE_URL');
    if (!base) {
      throw new Error('SECURITY_SERVICE_URL is not defined in the configuration');
    }
    this.baseUrl = base.endsWith('/') ? base : base + '/';
  }

  async createUserWithRole(
    roleId: string,
    userDto: CreateUserDto,
    token: string,
  ): Promise<CreateUserResponse> {
    try {
      const response: AxiosResponse<CreateUserResponse> = await firstValueFrom(
        this.http.post<CreateUserResponse>(
          `${this.baseUrl}user/${encodeURIComponent(roleId)}`,
          userDto,
          { headers: { Authorization: token } },
        ),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 400) {
        throw new BadRequestException('Usuario ya existe o datos inválidos');
      }
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  async findByEmail(email: string, token: string): Promise<UserTokenDto> {
    try {
      const emailParam = encodeURI(email);
      const resp = await firstValueFrom(
        this.http.get<UserTokenDto>(
          `${this.baseUrl}user/email/${emailParam}`,
          { headers: { Authorization: token } },
        ),
      );
      return resp.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        throw new NotFoundException(`User are ${email} not found in Security Service`);
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new InternalServerErrorException('Error fetching user from Security Service');
    }
  }


  async verifyUserExists(userId: string, token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get(`${this.baseUrl}user/${encodeURIComponent(userId)}`, {
          headers: { Authorization: token },
        }),
      );
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        throw new NotFoundException(`User #${userId} not found in Security Service`);
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new InternalServerErrorException('Error contacting Security Service');
    }
  }

  async findAll(token: string): Promise<UserTokenDto[]> {
    try {
      const resp = await firstValueFrom(
        this.http.get<UserTokenDto[]>(`${this.baseUrl}user`, {
          headers: { Authorization: token },
        }),
      );
      return resp.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new InternalServerErrorException('Error fetching users from Security Service');
    }
  }


  async findOne(userId: string, token: string): Promise<UserTokenDto> {
    try {
      const resp = await firstValueFrom(
        this.http.get<UserTokenDto>(`${this.baseUrl}user/${encodeURIComponent(userId)}`, {
          headers: { Authorization: token },
        }),
      );
      return resp.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        throw new NotFoundException(`User #${userId} not found in Security Service`);
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new InternalServerErrorException('Error fetching user from Security Service');
    }
  }

  async addStoreToUser(
    userId: string,
    storeId: number,
    token: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.baseUrl}user/${encodeURIComponent(userId)}/store`,
          { storeId },
          { headers: { Authorization: token } },
        ),
      );
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        throw new NotFoundException(`User #${userId} not found in Security Service`);
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new InternalServerErrorException('Error updating user in Security Service');
    }
  }

  async removeStoreFromUser(
    userId: string,
    storeId: number,
    token: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.baseUrl}user/${encodeURIComponent(userId)}/store/remove`,
          { storeId },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `User #${userId} not found in Security Service`,
        );
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new InternalServerErrorException(
        'Error updating user in Security Service: ' + error.message,
      );
    }
  }
}
