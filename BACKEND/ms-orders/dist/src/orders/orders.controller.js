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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const order_entity_1 = require("./entities/order.entity");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(userGuestId, storeId, authHeader, createOrderDto) {
        return this.ordersService.create(userGuestId, storeId, createOrderDto, authHeader);
    }
    async findAll() {
        return this.ordersService.findAll();
    }
    async findOne(id) {
        return this.ordersService.findOne(id);
    }
    async update(id, authHeader, updateData) {
        return this.ordersService.update(id, updateData, authHeader);
    }
    async remove(id) {
        return this.ordersService.remove(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('userGuest/:userGuestId/store/:storeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva orden' }),
    (0, swagger_1.ApiParam)({
        name: 'userGuestId',
        type: 'string',
        description: 'ID del usuario invitado (ObjectId de MongoDB)',
        example: '605c3f1e2e8f4b1a9a123456',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeId',
        type: 'number',
        description: 'ID de la tienda (entero)',
        example: 42,
    }),
    (0, swagger_1.ApiBody)({ type: create_order_dto_1.CreateOrderDto, description: 'Datos de la orden' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Orden creada exitosamente.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o recurso no encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token no provisto o inválido.' }),
    __param(0, (0, common_1.Param)('userGuestId')),
    __param(1, (0, common_1.Param)('storeId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las órdenes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listado de órdenes.', type: [order_entity_1.Order] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener orden por ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID de la orden (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orden encontrada.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Orden no encontrada.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar orden existente' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID de la orden a actualizar',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['UNASSIGNED', 'ASSIGNED', 'ATTEMPTED', 'REJECTED'] },
                totalAmount: { type: 'number' },
                currency: { type: 'string', example: 'USD' },
                address1: { type: 'string' },
                address2: { type: 'string', nullable: true },
                city: { type: 'string' },
                department: { type: 'string' },
                postalCode: { type: 'number' },
                instructions: { type: 'string', nullable: true },
                paymentMethod: { type: 'string', enum: ['CREDITCARD', 'CASH'] },
                paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
            },
        },
        description: 'Campos para actualizar en la orden',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orden actualizada.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o orden no existente.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token no provisto o inválido.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar orden por ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID de la orden a eliminar',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Orden eliminada.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Orden no encontrada.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "remove", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map