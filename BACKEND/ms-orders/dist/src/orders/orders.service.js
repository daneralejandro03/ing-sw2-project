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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const order_entity_1 = require("./entities/order.entity");
let OrdersService = class OrdersService {
    constructor(orderRepo, httpService) {
        this.orderRepo = orderRepo;
        this.httpService = httpService;
    }
    async create(userGuestId, storeId, createOrderDto, authToken) {
        if (!authToken || !authToken.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token no provisto para llamadas a Seguridad.');
        }
        try {
            const secBase = process.env.SECURITY_SERVICE_URL.replace(/\/$/, '');
            const secUrl = `${secBase}/user/${userGuestId}`;
            await (0, rxjs_1.firstValueFrom)(this.httpService.get(secUrl, {
                headers: { Authorization: authToken },
            }));
        }
        catch (err) {
            if (err.response?.status === 404) {
                throw new common_1.BadRequestException(`El userGuestId "${userGuestId}" no existe en Seguridad.`);
            }
            throw new common_1.BadRequestException(`Error validando userGuestId "${userGuestId}" en Seguridad.`);
        }
        try {
            const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
            const invUrl = `${invBase}/store/${storeId}`;
            await (0, rxjs_1.firstValueFrom)(this.httpService.get(invUrl));
        }
        catch (err) {
            if (err.response?.status === 404) {
                throw new common_1.BadRequestException(`El storeId "${storeId}" no existe en Inventario.`);
            }
            throw new common_1.BadRequestException(`Error validando storeId "${storeId}" en Inventario.`);
        }
        const orderEntity = this.orderRepo.create({
            status: createOrderDto.status,
            totalAmount: createOrderDto.totalAmount,
            currency: createOrderDto.currency,
            address1: createOrderDto.address1,
            address2: createOrderDto.address2,
            city: createOrderDto.city,
            department: createOrderDto.department,
            postalCode: createOrderDto.postalCode,
            instructions: createOrderDto.instructions,
            paymentMethod: createOrderDto.paymentMethod,
            paymentStatus: createOrderDto.paymentStatus,
            userGuestId,
            storeId,
            items: [],
            assignments: [],
        });
        try {
            return await this.orderRepo.save(orderEntity);
        }
        catch {
            throw new common_1.InternalServerErrorException('Error persistiendo la orden en la base de datos.');
        }
    }
    async findAll() {
        return this.orderRepo.find();
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({ where: { id } });
        if (!order) {
            throw new common_1.BadRequestException(`No existe orden con id "${id}".`);
        }
        return order;
    }
    async update(id, updateData, authToken) {
        const existing = await this.orderRepo.findOne({ where: { id } });
        if (!existing) {
            throw new common_1.BadRequestException(`No existe orden con id "${id}".`);
        }
        delete updateData.userGuestId;
        delete updateData.storeId;
        const merged = this.orderRepo.merge(existing, updateData);
        try {
            return await this.orderRepo.save(merged);
        }
        catch {
            throw new common_1.InternalServerErrorException('Error al actualizar la orden en la base de datos.');
        }
    }
    async remove(id) {
        const existing = await this.orderRepo.findOne({ where: { id } });
        if (!existing) {
            throw new common_1.BadRequestException(`No existe orden con id "${id}".`);
        }
        await this.orderRepo.delete(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        axios_1.HttpService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map