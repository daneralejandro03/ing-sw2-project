import {
  Controller, Post, UploadedFile, UseInterceptors, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CsvService } from './csv.service';

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
}
