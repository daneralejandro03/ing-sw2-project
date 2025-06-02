"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const assignment_entity_1 = require("./entities/assignment.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_status_enum_1 = require("../shared/enums/order-status.enum");
const PDFDocument = require('pdfkit');
const ExcelJS = require("exceljs");
const NON_ACTIVE_ASSIGNMENT_STATUSES_FOR_LIMIT = [
    order_status_enum_1.OrderStatus.REJECTED,
    order_status_enum_1.OrderStatus.UNASSIGNED,
];
const MAX_DRIVER_ASSIGNMENTS = 8;
let AssignmentsService = class AssignmentsService {
    constructor(assignmentRepo, orderRepo, httpService) {
        this.assignmentRepo = assignmentRepo;
        this.orderRepo = orderRepo;
        this.httpService = httpService;
    }
    async create(orderId, userDeliveryDriver, createAssignmentDto, authToken) {
        const { status, note, date } = createAssignmentDto;
        if (!authToken || !authToken.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token no provisto o con formato incorrecto.');
        }
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.BadRequestException(`La orden con id "${orderId}" no existe.`);
        }
        const activeAssignmentsCount = await this.assignmentRepo.count({
            where: {
                userDeliveryDriver: userDeliveryDriver,
                status: (0, typeorm_2.Not)((0, typeorm_2.In)(NON_ACTIVE_ASSIGNMENT_STATUSES_FOR_LIMIT)),
            },
        });
        if (activeAssignmentsCount >= MAX_DRIVER_ASSIGNMENTS) {
            throw new common_1.BadRequestException(`El repartidor "${userDeliveryDriver}" ya alcanzó el límite de ${MAX_DRIVER_ASSIGNMENTS} asignaciones activas.`);
        }
        const secBase = process.env.SECURITY_SERVICE_URL?.replace(/\/$/, '');
        if (!secBase) {
            throw new common_1.InternalServerErrorException('SECURITY_SERVICE_URL no está configurada.');
        }
        let userData;
        try {
            const userUrl = `${secBase}/user/${userDeliveryDriver}`;
            const resp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(userUrl, { headers: { Authorization: authToken } }));
            userData = resp.data;
        }
        catch (err) {
            const axiosErr = err;
            if (axiosErr.response?.status === 404) {
                throw new common_1.BadRequestException(`El repartidor "${userDeliveryDriver}" no existe en Seguridad.`);
            }
            throw new common_1.InternalServerErrorException(`Error validando repartidor "${userDeliveryDriver}".`);
        }
        const roleId = userData.role._id;
        if (!roleId || typeof roleId !== 'string') {
            throw new common_1.BadRequestException(`Usuario "${userDeliveryDriver}" no tiene un ID de rol válido.`);
        }
        let roleData;
        try {
            const roleUrl = `${secBase}/role/${roleId}`;
            const respRole = await (0, rxjs_1.firstValueFrom)(this.httpService.get(roleUrl, { headers: { Authorization: authToken } }));
            roleData = respRole.data;
        }
        catch (err) {
            const axiosErr = err;
            if (axiosErr.response?.status === 404) {
                throw new common_1.BadRequestException(`El roleId "${roleId}" no existe en Seguridad.`);
            }
            throw new common_1.InternalServerErrorException(`Error consultando el rol "${roleId}".`);
        }
        if (roleData.name !== 'DeliveryDriver') {
            throw new common_1.BadRequestException(`Usuario "${userDeliveryDriver}" no tiene rol DeliveryDriver (rol actual: ${roleData.name}).`);
        }
        const assignmentEntity = this.assignmentRepo.create({
            date: date || new Date(),
            status: status || order_status_enum_1.OrderStatus.ASSIGNED,
            note,
            userDeliveryDriver,
            order,
        });
        try {
            return await this.assignmentRepo.save(assignmentEntity);
        }
        catch (dbError) {
            throw new common_1.InternalServerErrorException(`Error interno al guardar la asignación: ${dbError.message}`);
        }
    }
    async findAll() {
        return this.assignmentRepo.find({ relations: ['order'] });
    }
    async findOne(id) {
        const assignment = await this.assignmentRepo.findOne({
            where: { id },
            relations: ['order'],
        });
        if (!assignment) {
            throw new common_1.NotFoundException(`No existe assignment con id "${id}".`);
        }
        return assignment;
    }
    async update(id, updateData) {
        const assignmentToUpdate = await this.assignmentRepo.preload({
            id: id,
            ...updateData,
        });
        if (!assignmentToUpdate) {
            throw new common_1.NotFoundException(`No existe assignment con id "${id}" para actualizar.`);
        }
        try {
            return await this.assignmentRepo.save(assignmentToUpdate);
        }
        catch (dbError) {
            throw new common_1.InternalServerErrorException(`Error interno al actualizar la asignación: ${dbError.message}`);
        }
    }
    async remove(id) {
        const result = await this.assignmentRepo.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`No existe assignment con id "${id}" para eliminar.`);
        }
    }
    async getAssignmentsForReportByDriverAndDate(driverId, targetDate) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const assignments = await this.assignmentRepo.find({
            where: {
                userDeliveryDriver: driverId,
                date: (0, typeorm_2.Between)(startOfDay, endOfDay),
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
    async generatePdfReportForDriver(driverId, targetDate) {
        const reportData = await this.getAssignmentsForReportByDriverAndDate(driverId, targetDate);
        return this.generatePdfFromData(reportData, driverId, targetDate);
    }
    generatePdfFromData(reportData, driverId, targetDate) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 40, bottom: 40, left: 20, right: 20 },
            });
            const buffers = [];
            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', err => reject(new common_1.InternalServerErrorException('Error generando PDF.')));
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
    async generateExcelReportForDriver(driverId, targetDate) {
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
        return workbook.xlsx.writeBuffer();
    }
    convertToCsv(data) {
        if (!data || data.length === 0) {
            return 'No hay datos disponibles para generar el reporte CSV.';
        }
        const headersOrder = [
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
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map