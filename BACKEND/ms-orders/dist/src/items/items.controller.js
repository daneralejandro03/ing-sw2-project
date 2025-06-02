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
exports.ItemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const items_service_1 = require("./items.service");
const create_item_dto_1 = require("./dto/create-item.dto");
const item_entity_1 = require("./entities/item.entity");
let ItemsController = class ItemsController {
    constructor(itemsService) {
        this.itemsService = itemsService;
    }
    async create(orderId, productId, createItemDto) {
        return this.itemsService.create(orderId, productId, createItemDto);
    }
    async findAll() {
        return this.itemsService.findAll();
    }
    async findOne(id) {
        return this.itemsService.findOne(id);
    }
    async update(id, updateData) {
        return this.itemsService.update(id, updateData);
    }
    async remove(id) {
        return this.itemsService.remove(id);
    }
};
exports.ItemsController = ItemsController;
__decorate([
    (0, common_1.Post)('order/:orderId/product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo ítem para una orden' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', type: 'string', description: 'ID de la orden Mongo' }),
    (0, swagger_1.ApiParam)({ name: 'productId', type: 'number', description: 'ID del producto (entero)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                quantity: { type: 'number', minimum: 1, example: 2 },
            },
        },
        description: 'Cantidad del ítem a crear',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ítem creado exitosamente.', type: item_entity_1.Item }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o recurso no encontrado.' }),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, create_item_dto_1.CreateItemDto]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos los ítems' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Listado de ítems.',
        type: [item_entity_1.Item],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener ítem por ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        description: 'ID del ítem Mongo',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ítem encontrado.',
        type: item_entity_1.Item,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ítem no encontrado.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un ítem existente' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ítem a actualizar',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Nombre del producto modificado' },
                quantity: { type: 'number', minimum: 1, example: 2 },
                unitPrice: { type: 'number', minimum: 0, example: 50.0 },
                totalPrice: { type: 'number', minimum: 0, example: 100.0 },
            },
        },
        description: 'Campos a actualizar en el ítem',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ítem actualizado.',
        type: item_entity_1.Item,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o ítem no existente.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un ítem por ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ítem a eliminar',
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Ítem eliminado.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ítem no encontrado.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "remove", null);
exports.ItemsController = ItemsController = __decorate([
    (0, swagger_1.ApiTags)('Items'),
    (0, common_1.Controller)('items'),
    __metadata("design:paramtypes", [items_service_1.ItemsService])
], ItemsController);
//# sourceMappingURL=items.controller.js.map