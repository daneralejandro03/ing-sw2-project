import { Test, TestingModule } from '@nestjs/testing';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('CsvController', () => {
  let controller: CsvController;
  let service: CsvService;

  const mockCsvService = {
    uploadDepartamentsAndCitys: jest.fn(),
    importStores: jest.fn(),
    importProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvController],
      providers: [
        { provide: CsvService, useValue: mockCsvService },
      ],
    })
    .overrideGuard(JwtAuthGuard)            // Cambiado de overrideProvider a overrideGuard
    .useValue({ canActivate: () => true }) // Mock para que el guard siempre permita
    .compile();

    controller = module.get<CsvController>(CsvController);
    service = module.get<CsvService>(CsvService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadCsvDepartamentsAndCitys', () => {
    it('should call service and return success message', async () => {
      const file = { buffer: Buffer.from('test csv') } as Express.Multer.File;

      await expect(controller.uploadCsvDepartamentsAndCitys(file)).resolves.toEqual({
        message: 'CSV procesado con éxito',
      });

      expect(service.uploadDepartamentsAndCitys).toHaveBeenCalledWith(file.buffer);
    });

    it('should throw if file is invalid', async () => {
      const file = { buffer: null } as unknown as Express.Multer.File;

      await expect(controller.uploadCsvDepartamentsAndCitys(file)).rejects.toThrow(BadRequestException);
    });
  });

  describe('processCsvInventory', () => {
    it('should call importStores with token and buffer', async () => {
      const file = { buffer: Buffer.from('almacenes') } as Express.Multer.File;
      const token = 'Bearer test.token.here';
      const req = {
        headers: {
          authorization: token,
        },
      } as any;

      await expect(controller.processCsvInventory(file, req)).resolves.toEqual({
        message: 'CSV procesado con éxito',
      });

      expect(service.importStores).toHaveBeenCalledWith(file.buffer, token);
    });

    it('should throw if no token is present', async () => {
      const file = { buffer: Buffer.from('almacenes') } as Express.Multer.File;
      const req = {
        headers: {},
      } as any;

      await expect(controller.processCsvInventory(file, req)).rejects.toThrow(BadRequestException);
    });

    it('should throw if no file is present', async () => {
      const req = {
        headers: { authorization: 'Bearer test' },
      } as any;

      await expect(controller.processCsvInventory(undefined as any, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('processCsvProducts', () => {
    it('should call importProducts and return success message', async () => {
      const file = { buffer: Buffer.from('productos') } as Express.Multer.File;

      await expect(controller.processCsvProducts(file)).resolves.toEqual({
        message: 'CSV procesado con éxito',
      });

      expect(service.importProducts).toHaveBeenCalledWith(file.buffer);
    });

    it('should throw if file is invalid', async () => {
      const file = { buffer: null } as unknown as Express.Multer.File;

      await expect(controller.processCsvProducts(file)).rejects.toThrow(BadRequestException);
    });
  });
});
