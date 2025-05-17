import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import * as multer from 'multer';
import { CsvService } from './csv.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Csv')
@ApiBearerAuth()
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) { }

  @ApiOperation({ summary: 'Cargar CSV de departamentos y ciudades' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo CSV con departamentos y ciudades',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'CSV procesado con éxito' })
  @Post('uploadDepartamentsAndCitys')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadCsvDepartamentsAndCitys(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Archivo inválido o buffer ausente');
    }
    await this.csvService.uploadDepartamentsAndCitys(file.buffer);
    return { message: 'CSV procesado con éxito' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Procesar CSV de tiendas (requiere autenticación)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo CSV con datos de tiendas',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'CSV de tiendas procesado con éxito' })
  @Post('processCsvStore')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async processCsvInventory(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    if (!file?.buffer) throw new BadRequestException('Archivo inválido');
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new BadRequestException('No hay token');
    await this.csvService.importStores(file.buffer, authHeader);
    return { message: 'CSV procesado con éxito' };
  }

  @ApiOperation({ summary: 'Procesar CSV de productos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo CSV con datos de productos',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'CSV de productos procesado con éxito' })
  @Post('processCsvProducts')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async processCsvProducts(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Archivo inválido o buffer ausente');
    }
    await this.csvService.importProducts(file.buffer);
    return { message: 'CSV procesado con éxito' };
  }
}
