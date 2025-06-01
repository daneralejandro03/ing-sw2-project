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
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const assignments_service_1 = require("./assignments.service");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const assignment_entity_1 = require("./entities/assignment.entity");
let AssignmentsController = class AssignmentsController {
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    async create(orderId, userDeliveryDriver, authHeader, createAssignmentDto) {
        return this.assignmentsService.create(orderId, userDeliveryDriver, createAssignmentDto, authHeader);
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
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Post)('order/:orderId/DeliveryDriver/:userDeliveryDriver'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva asignación de repartidor para una orden' }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        type: 'string',
        format: 'uuid',
        description: 'ID de la orden (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userDeliveryDriver',
        type: 'string',
        description: 'ID del repartidor (ObjectId de MongoDB)',
        example: '605c3f1e2e8f4b1a9a123456',
    }),
    (0, swagger_1.ApiBody)({
        type: create_assignment_dto_1.CreateAssignmentDto,
        description: 'Datos de la asignación (status, note, date)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Asignación creada exitosamente.',
        type: assignment_entity_1.Assignment,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o recurso no encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token no provisto o inválido.' }),
    __param(0, (0, common_1.Param)('orderId', common_2.ParseUUIDPipe)),
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
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Listado de asignaciones.',
        type: [assignment_entity_1.Assignment],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignación por ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID de la asignación (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Asignación encontrada.',
        type: assignment_entity_1.Assignment,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Asignación no encontrada.' }),
    __param(0, (0, common_1.Param)('id', common_2.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una asignación existente' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID de la asignación a actualizar',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['UNASSIGNED', 'ASSIGNED', 'ATTEMPTED', 'REJECTED'],
                },
                note: { type: 'string', maxLength: 500 },
                date: { type: 'string', format: 'date-time' },
            },
        },
        description: 'Campos a actualizar en la asignación',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Asignación actualizada.',
        type: assignment_entity_1.Assignment,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o asignación no existente.' }),
    __param(0, (0, common_1.Param)('id', common_2.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una asignación por ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID de la asignación a eliminar',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Asignación eliminada.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Asignación no encontrada.' }),
    __param(0, (0, common_1.Param)('id', common_2.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "remove", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('Assignments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('assignments'),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map