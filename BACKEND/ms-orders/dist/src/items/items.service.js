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
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const item_entity_1 = require("./entities/item.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let ItemsService = class ItemsService {
    constructor(itemRepo, orderRepo, httpService) {
        this.itemRepo = itemRepo;
        this.orderRepo = orderRepo;
        this.httpService = httpService;
    }
    async create(orderId, productId, createItemDto) {
        const { quantity } = createItemDto;
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.BadRequestException(`El orderId "${orderId}" no existe.`);
        }
        let productData;
        try {
            const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
            const prodUrl = `${invBase}/product/${productId}`;
            const resp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(prodUrl));
            productData = resp.data;
        }
        catch (err) {
            const axiosErr = err;
            if (axiosErr.response?.status === 404) {
                throw new common_1.BadRequestException(`El productId "${productId}" no existe en Inventario.`);
            }
            throw new common_1.BadRequestException(`Error validando productId "${productId}" en Inventario.`);
        }
        const name = productData.name;
        const unitPrice = productData.unitPrice;
        if (!name || unitPrice === undefined || unitPrice === null) {
            throw new common_1.BadRequestException('Datos inválidos del producto recibidos desde Inventario.');
        }
        const totalPrice = quantity * unitPrice;
        const itemEntity = this.itemRepo.create({
            name,
            quantity,
            unitPrice,
            totalPrice,
            productId,
            order,
        });
        try {
            return await this.itemRepo.save(itemEntity);
        }
        catch {
            throw new common_1.InternalServerErrorException('Error guardando el ítem en la base de datos.');
        }
    }
    async findAll() {
        return this.itemRepo.find({ relations: ['order'] });
    }
    async findOne(id) {
        const item = await this.itemRepo.findOne({
            where: { id },
            relations: ['order'],
        });
        if (!item) {
            throw new common_1.BadRequestException(`No existe ítem con id "${id}".`);
        }
        return item;
    }
    async update(id, updateData) {
        const existing = await this.itemRepo.findOne({
            where: { id },
            relations: ['order'],
        });
        if (!existing) {
            throw new common_1.BadRequestException(`No existe ítem con id "${id}".`);
        }
        if (updateData.quantity !== undefined && updateData.quantity < 1) {
            throw new common_1.BadRequestException('La cantidad debe ser al menos 1.');
        }
        let productData;
        try {
            const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
            const prodUrl = `${invBase}/product/${existing.productId}`;
            const resp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(prodUrl));
            productData = resp.data;
        }
        catch (err) {
            throw new common_1.BadRequestException(`Error obteniendo datos del producto con ID "${existing.productId}" desde Inventario.`);
        }
        const name = productData.name;
        const unitPrice = productData.unitPrice;
        if (!name || unitPrice === undefined || unitPrice === null) {
            throw new common_1.BadRequestException('Datos inválidos del producto recibidos desde Inventario.');
        }
        existing.quantity = updateData.quantity ?? existing.quantity;
        existing.name = name;
        existing.unitPrice = unitPrice;
        existing.totalPrice = existing.quantity * existing.unitPrice;
        try {
            return await this.itemRepo.save(existing);
        }
        catch {
            throw new common_1.InternalServerErrorException('Error al actualizar el ítem.');
        }
    }
    async remove(id) {
        const existing = await this.itemRepo.findOne({ where: { id } });
        if (!existing) {
            throw new common_1.BadRequestException(`No existe ítem con id "${id}".`);
        }
        await this.itemRepo.delete(id);
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService])
], ItemsService);
//# sourceMappingURL=items.service.js.map