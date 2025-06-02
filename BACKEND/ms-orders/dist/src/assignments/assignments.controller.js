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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const assignments_service_1 = require("./assignments.service");
const assignment_entity_1 = require("./entities/assignment.entity");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const common_2 = require("@nestjs/common");
let AssignmentsController = class AssignmentsController {
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    getTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token no provisto o con formato incorrecto.');
        }
        return authHeader.substring(7);
    }
    async create(orderId, userDeliveryDriver, authHeader, createAssignmentDto) {
        const token = this.getTokenFromHeader(authHeader);
        return this.assignmentsService.create(orderId, userDeliveryDriver, createAssignmentDto, `Bearer ${token}`);
    }
    async findAll() {
        return this.assignmentsService.findAll();
    }
    async findOne(id) {
        return this.assignmentsService.findOne(id);
    }
    async update(id, updateData) {
        return this.assignmentsService.update(id, updateData);
    }
    async remove(id) {
        return this.assignmentsService.remove(id);
    }
    async getJsonReportForDriverToday(driverId) {
        const today = new Date();
        return this.assignmentsService.getAssignmentsForReportByDriverAndDate(driverId, today);
    }
    async getCsvReportForDriverToday(driverId, res) {
        const today = new Date();
        const reportData = await this.assignmentsService.getAssignmentsForReportByDriverAndDate(driverId, today);
        if (reportData.length === 0) {
            res.setHeader('Content-Type', 'text/plain');
            res.status(common_1.HttpStatus.OK).send('No hay asignaciones para reportar para este repartidor en la fecha actual.');
            return;
        }
        const csvData = this.assignmentsService.convertToCsv(reportData);
        const fileNameDate = today.toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_asignaciones_${driverId}_${fileNameDate}.csv`);
        res.status(common_1.HttpStatus.OK).send(csvData);
    }
    async getPdfReportForDriverToday(driverId, res) {
        const today = new Date();
        try {
            const pdfBuffer = await this.assignmentsService.generatePdfReportForDriver(driverId, today);
            const fileNameDate = today.toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_asignaciones_${driverId}_${fileNameDate}.pdf`);
            res.status(common_1.HttpStatus.OK).send(pdfBuffer);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                res.status(common_1.HttpStatus.NOT_FOUND).send({ message: error.message });
            }
            else {
                res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error interno al generar el reporte PDF.' });
            }
        }
    }
    async getExcelReportForDriverToday(driverId, res) {
        const today = new Date();
        try {
            const excelBuffer = await this.assignmentsService.generateExcelReportForDriver(driverId, today);
            const fileNameDate = today.toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_asignaciones_${driverId}_${fileNameDate}.xlsx`);
            res.status(common_1.HttpStatus.OK).send(excelBuffer);
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error interno al generar el reporte Excel.' });
        }
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Post)('order/:orderId/DeliveryDriver/:userDeliveryDriver'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva asignación de repartidor para una orden' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', type: String, description: 'ID de la orden' }),
    (0, swagger_1.ApiParam)({ name: 'userDeliveryDriver', type: String, description: 'ID del repartidor' }),
    (0, swagger_1.ApiBody)({ type: create_assignment_dto_1.CreateAssignmentDto, description: 'Datos de la asignación' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asignación creada exitosamente.', type: assignment_entity_1.Assignment }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o recurso no encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token no provisto o inválido.' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('userDeliveryDriver')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las asignaciones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listado de asignaciones.', type: [assignment_entity_1.Assignment] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignación por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'ID de la asignación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación encontrada.', type: assignment_entity_1.Assignment }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una asignación existente' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'ID de la asignación a actualizar' }),
    (0, swagger_1.ApiBody)({ type: create_assignment_dto_1.CreateAssignmentDto, description: 'Campos a actualizar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación actualizada.', type: assignment_entity_1.Assignment }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no existente.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una asignación por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'ID de la asignación a eliminar' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Asignación eliminada.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('reports/driver/:driverId/today/json'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener reporte JSON de asignaciones de un repartidor para la fecha actual' }),
    (0, swagger_1.ApiParam)({ name: 'driverId', description: 'ID del repartidor', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Datos del reporte en JSON.', type: Object }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado.' }),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getJsonReportForDriverToday", null);
__decorate([
    (0, common_1.Get)('reports/driver/:driverId/today/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar reporte CSV de asignaciones de un repartidor para la fecha actual' }),
    (0, swagger_1.ApiParam)({ name: 'driverId', description: 'ID del repartidor', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo CSV con el reporte.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado.' }),
    (0, swagger_1.ApiProduces)('text/csv'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getCsvReportForDriverToday", null);
__decorate([
    (0, common_1.Get)('reports/driver/:driverId/today/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar reporte PDF de asignaciones de un repartidor para la fecha actual' }),
    (0, swagger_1.ApiParam)({ name: 'driverId', description: 'ID del repartidor', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo PDF con el reporte.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado.' }),
    (0, swagger_1.ApiProduces)('application/pdf'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getPdfReportForDriverToday", null);
__decorate([
    (0, common_1.Get)('reports/driver/:driverId/today/excel'),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar reporte Excel de asignaciones de un repartidor para la fecha actual' }),
    (0, swagger_1.ApiParam)({ name: 'driverId', description: 'ID del repartidor', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo Excel con el reporte.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado.' }),
    (0, swagger_1.ApiProduces)('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getExcelReportForDriverToday", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('Assignments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('assignments'),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map