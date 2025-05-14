import {
  Controller, Post, UploadedFile, UseInterceptors, BadRequestException, UseGuards, Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import * as multer from 'multer';
import { CsvService } from './csv.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) { }

  @Post('uploadDepartamentsAndCitys')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadCsvDepartamentsAndCitys(@UploadedFile() file: Express.Multer.File): Promise<{ message: string }> {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Archivo inválido o buffer ausente');
    } const buffer = file.buffer;
    await this.csvService.uploadDepartamentsAndCitys(buffer);
    return { message: 'CSV procesado con éxito' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('processCsvStore')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async processCsvInventory(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    if (!file?.buffer) throw new BadRequestException('Archivo inválido');

    const authHeader = req.headers.authorization;
    console.log('authHeader', authHeader);
    if (!authHeader) throw new BadRequestException('No hay token');

    // authHeader === "Bearer x.y.z"
    await this.csvService.importStores(file.buffer, authHeader);
    return { message: 'CSV procesado con éxito' };
  }

  @Post('processCsvProducts')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async processCsvProducts(@UploadedFile() file: Express.Multer.File): Promise<{ message: string }> {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Archivo inválido o buffer ausente');
    } const buffer = file.buffer;
    await this.csvService.importProducts(buffer);
    return { message: 'CSV procesado con éxito' };
  }

}
