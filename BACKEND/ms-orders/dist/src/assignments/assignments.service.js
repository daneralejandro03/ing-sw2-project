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
let AssignmentsService = class AssignmentsService {
    constructor(assignmentRepo, orderRepo, httpService) {
        this.assignmentRepo = assignmentRepo;
        this.orderRepo = orderRepo;
        this.httpService = httpService;
    }
    async create(orderId, userDeliveryDriver, createAssignmentDto, authToken) {
        const { status, note, date } = createAssignmentDto;
        if (!authToken || !authToken.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token no provisto para llamadas a Seguridad.');
        }
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.BadRequestException(`La orden con id "${orderId}" no existe.`);
        }
        const secBase = process.env.SECURITY_SERVICE_URL.replace(/\/$/, '');
        let userData;
        try {
            const userUrl = `${secBase}/user/${userDeliveryDriver}`;
            const resp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(userUrl, {
                headers: { Authorization: authToken },
            }));
            userData = resp.data;
        }
        catch (err) {
            const axiosErr = err;
            if (axiosErr.response?.status === 404) {
                throw new common_1.BadRequestException(`El repartidor "${userDeliveryDriver}" no existe en Seguridad.`);
            }
            throw new common_1.BadRequestException(`Error validando repartidor "${userDeliveryDriver}" en Seguridad.`);
        }
        const roleId = userData.role;
        if (!roleId) {
            throw new common_1.BadRequestException(`El usuario "${userDeliveryDriver}" no tiene rol asignado.`);
        }
        let roleData;
        try {
            const roleUrl = `${secBase}/role/${roleId}`;
            const respRole = await (0, rxjs_1.firstValueFrom)(this.httpService.get(roleUrl, {
                headers: { Authorization: authToken },
            }));
            roleData = respRole.data;
        }
        catch (err) {
            const axiosErr = err;
            if (axiosErr.response?.status === 404) {
                throw new common_1.BadRequestException(`El roleId "${roleId}" no existe en Seguridad.`);
            }
            throw new common_1.BadRequestException(`Error consultando el rol "${roleId}" en Seguridad.`);
        }
        if (roleData.name !== 'DeliveryDriver') {
            throw new common_1.BadRequestException(`El usuario "${userDeliveryDriver}" no tiene rol de DeliveryDriver.`);
        }
        const assignmentEntity = this.assignmentRepo.create({
            date,
            status,
            note,
            userDeliveryDriver,
            order,
        });
        try {
            return await this.assignmentRepo.save(assignmentEntity);
        }
        catch {
            throw new common_1.InternalServerErrorException('Error guardando la asignación.');
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
            throw new common_1.BadRequestException(`No existe assignment con id "${id}".`);
        }
        return assignment;
    }
    async update(id, updateData) {
        const existing = await this.assignmentRepo.findOne({
            where: { id },
            relations: ['order'],
        });
        if (!existing) {
            throw new common_1.BadRequestException(`No existe assignment con id "${id}".`);
        }
        delete updateData.userDeliveryDriver;
        const merged = this.assignmentRepo.merge(existing, updateData);
        try {
            return await this.assignmentRepo.save(merged);
        }
        catch {
            throw new common_1.InternalServerErrorException('Error al actualizar la asignación.');
        }
    }
    async remove(id) {
        const existing = await this.assignmentRepo.findOne({ where: { id } });
        if (!existing) {
            throw new common_1.BadRequestException(`No existe assignment con id "${id}".`);
        }
        await this.assignmentRepo.delete(id);
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