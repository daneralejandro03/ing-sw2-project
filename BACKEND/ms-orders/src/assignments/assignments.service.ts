import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Between } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Order } from 'src/orders/entities/order.entity';
import { OrderStatus } from '../shared/enums/order-status.enum';
import { AssignmentReportData } from '../shared/enums/AssignmentReportData.enum';

// Cambié esta línea para usar require en lugar de import ESModule:
const PDFDocument = require('pdfkit');
import * as ExcelJS from 'exceljs';

const NON_ACTIVE_ASSIGNMENT_STATUSES_FOR_LIMIT: OrderStatus[] = [
  OrderStatus.REJECTED,
  OrderStatus.UNASSIGNED,
];

const MAX_DRIVER_ASSIGNMENTS = 8;

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly httpService: HttpService,
  ) { }

  async create(
    orderId: string,
    userDeliveryDriver: string,
    createAssignmentDto: CreateAssignmentDto,
    authToken: string,
  ): Promise<Assignment> {
    const { status, note, date } = createAssignmentDto;

    if (!authToken || !authToken.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o con formato incorrecto.');
    }

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException(`La orden con id "${orderId}" no existe.`);
    }

    const activeAssignmentsCount = await this.assignmentRepo.count({
      where: {
        userDeliveryDriver: userDeliveryDriver,
        status: Not(In(NON_ACTIVE_ASSIGNMENT_STATUSES_FOR_LIMIT)),
      },
    });
    if (activeAssignmentsCount >= MAX_DRIVER_ASSIGNMENTS) {
      throw new BadRequestException(
        `El repartidor "${userDeliveryDriver}" ya alcanzó el límite de ${MAX_DRIVER_ASSIGNMENTS} asignaciones activas.`,
      );
    }

    const secBase = process.env.SECURITY_SERVICE_URL?.replace(/\/$/, '');
    if (!secBase) {
      throw new InternalServerErrorException('SECURITY_SERVICE_URL no está configurada.');
    }

    let userData: any;
    try {
      const userUrl = `${secBase}/user/${userDeliveryDriver}`;
      const resp = await firstValueFrom(
        this.httpService.get(userUrl, { headers: { Authorization: authToken } }),
      );
      userData = resp.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new BadRequestException(`El repartidor "${userDeliveryDriver}" no existe en Seguridad.`);
      }
      throw new InternalServerErrorException(`Error validando repartidor "${userDeliveryDriver}".`);
    }

    const roleId = userData.role._id;
    if (!roleId || typeof roleId !== 'string') {
      throw new BadRequestException(`Usuario "${userDeliveryDriver}" no tiene un ID de rol válido.`);
    }

    let roleData: any;
    try {
      const roleUrl = `${secBase}/role/${roleId}`;
      const respRole = await firstValueFrom(
        this.httpService.get(roleUrl, { headers: { Authorization: authToken } }),
      );
      roleData = respRole.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new BadRequestException(`El roleId "${roleId}" no existe en Seguridad.`);
      }
      throw new InternalServerErrorException(`Error consultando el rol "${roleId}".`);
    }

    if (roleData.name !== 'DeliveryDriver') {
      throw new BadRequestException(
        `Usuario "${userDeliveryDriver}" no tiene rol DeliveryDriver (rol actual: ${roleData.name}).`,
      );
    }

    const assignmentEntity = this.assignmentRepo.create({
      date: date || new Date(),
      status: status || OrderStatus.ASSIGNED,
      note,
      userDeliveryDriver,
      order,
    });

    try {
      return await this.assignmentRepo.save(assignmentEntity);
    } catch (dbError: any) {
      throw new InternalServerErrorException(`Error interno al guardar la asignación: ${dbError.message}`);
    }
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentRepo.find({ relations: ['order'] });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!assignment) {
      throw new NotFoundException(`No existe assignment con id "${id}".`);
    }
    return assignment;
  }

  async update(
    id: string,
    updateData: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    const assignmentToUpdate = await this.assignmentRepo.preload({
      id: id,
      ...updateData,
    });
    if (!assignmentToUpdate) {
      throw new NotFoundException(`No existe assignment con id "${id}" para actualizar.`);
    }
    try {
      return await this.assignmentRepo.save(assignmentToUpdate);
    } catch (dbError: any) {
      throw new InternalServerErrorException(`Error interno al actualizar la asignación: ${dbError.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.assignmentRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No existe assignment con id "${id}" para eliminar.`);
    }
  }

  async getAssignmentsForReportByDriverAndDate(
    driverId: string,
    targetDate: Date,
  ): Promise<AssignmentReportData[]> {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const assignments = await this.assignmentRepo.find({
      where: {
        userDeliveryDriver: driverId,
        date: Between(startOfDay, endOfDay),
      },
      relations: ['order'],
      order: { date: 'ASC' },
    });

    if (!assignments || assignments.length === 0) {
      return [];
    }

    return assignments.map(assignment => {
      let fullOrderAddress = assignment.order.address1 || '';
      if (assignment.order.address2) {
        fullOrderAddress += ` ${assignment.order.address2}`;
      }
      return {
        assignmentId: assignment.id,
        assignmentDate: assignment.date.toISOString(),
        assignmentStatus: assignment.status,
        assignmentNote: assignment.note || '',
        driverId: assignment.userDeliveryDriver,
        orderId: assignment.order.id,
        orderStatus: assignment.order.status,
        orderTotalAmount: `${assignment.order.totalAmount || '0.00'} ${assignment.order.currency || ''}`,
        orderAddress: fullOrderAddress.trim(),
        orderCity: assignment.order.city || '',
        orderDepartment: assignment.order.department || '',
      };
    });
  }

  async generatePdfReportForDriver(
    driverId: string,
    targetDate: Date,
  ): Promise<Buffer> {
    const reportData = await this.getAssignmentsForReportByDriverAndDate(driverId, targetDate);
    return this.generatePdfFromData(reportData, driverId, targetDate);
  }

  private generatePdfFromData(
    reportData: AssignmentReportData[],
    driverId: string,
    targetDate: Date,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 20, right: 20 },
      });
      const buffers: Buffer[] = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(new InternalServerErrorException('Error generando PDF.')));

      doc.fontSize(18).text(`Reporte de Asignaciones - Repartidor: ${driverId}`, { align: 'center' });
      doc.moveDown(0.5);
      const formattedDate = targetDate.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.fontSize(14).text(`Fecha: ${formattedDate}`, { align: 'center' });
      doc.moveDown(1);

      if (reportData.length === 0) {
        doc
          .fontSize(12)
          .text('No se encontraron asignaciones para esta fecha y repartidor.', { align: 'center' });
        doc.end();
        return;
      }

      const startX = doc.page.margins.left;
      const startY = doc.y;
      const columnWidths = [80, 100, 80, 100, 60, 80, 80, 120, 60, 60];
      const headers = [
        'ID Asig.',
        'Fecha Asig.',
        'Estado Asig.',
        'Nota',
        'ID Orden',
        'Estado Orden',
        'Monto',
        'Dirección',
        'Ciudad',
        'Dpto',
      ];

      let x = startX;
      let y = startY;
      doc.fontSize(8).fillColor('black');
      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: columnWidths[i], align: 'left', continued: false });
        x += columnWidths[i];
      });
      y += 20;

      reportData.forEach(item => {
        x = startX;
        const dateText = new Date(item.assignmentDate).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const row = [
          item.assignmentId,
          dateText,
          item.assignmentStatus,
          item.assignmentNote || '',
          item.orderId,
          item.orderStatus,
          item.orderTotalAmount,
          item.orderAddress,
          item.orderCity,
          item.orderDepartment,
        ];
        row.forEach((cell, i) => {
          doc.text(cell, x, y, { width: columnWidths[i], align: 'left', continued: false });
          x += columnWidths[i];
        });
        y += 20;
        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage({ size: 'A4', layout: 'landscape' });
          y = doc.y;
        }
      });

      doc.end();
    });
  }

  async generateExcelReportForDriver(
    driverId: string,
    targetDate: Date,
  ): Promise<Buffer> {
    const reportData = await this.getAssignmentsForReportByDriverAndDate(driverId, targetDate);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asignaciones');
    sheet.columns = [
      { header: 'ID Asignación', key: 'assignmentId', width: 20 },
      { header: 'Fecha Asig.', key: 'assignmentDate', width: 25 },
      { header: 'Estado Asig.', key: 'assignmentStatus', width: 15 },
      { header: 'Nota', key: 'assignmentNote', width: 30 },
      { header: 'ID Orden', key: 'orderId', width: 15 },
      { header: 'Estado Orden', key: 'orderStatus', width: 15 },
      { header: 'Monto', key: 'orderTotalAmount', width: 15 },
      { header: 'Dirección', key: 'orderAddress', width: 40 },
      { header: 'Ciudad', key: 'orderCity', width: 15 },
      { header: 'Dpto', key: 'orderDepartment', width: 15 },
    ];

    reportData.forEach(item => {
      const dateText = new Date(item.assignmentDate).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      sheet.addRow({
        assignmentId: item.assignmentId,
        assignmentDate: dateText,
        assignmentStatus: item.assignmentStatus,
        assignmentNote: item.assignmentNote || '',
        orderId: item.orderId,
        orderStatus: item.orderStatus,
        orderTotalAmount: item.orderTotalAmount,
        orderAddress: item.orderAddress,
        orderCity: item.orderCity,
        orderDepartment: item.orderDepartment,
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  convertToCsv(data: AssignmentReportData[]): string {
    if (!data || data.length === 0) {
      return 'No hay datos disponibles para generar el reporte CSV.';
    }

    const headersOrder: (keyof AssignmentReportData)[] = [
      'assignmentId',
      'assignmentDate',
      'assignmentStatus',
      'assignmentNote',
      'driverId',
      'orderId',
      'orderStatus',
      'orderTotalAmount',
      'orderAddress',
      'orderCity',
      'orderDepartment',
    ];

    const csvHeader = headersOrder.join(',');

    const rows = data.map(row => {
      return headersOrder
        .map(header => {
          let value = row[header];
          value = value === null || value === undefined ? '' : String(value);
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',');
    });

    return `${csvHeader}\n${rows.join('\n')}`;
  }
}
