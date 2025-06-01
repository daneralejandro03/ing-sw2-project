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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const order_status_enum_1 = require("../../shared/enums/order-status.enum");
const payment_method_enum_1 = require("../../shared/enums/payment-method.enum");
const payment_status_enum_1 = require("../../shared/enums/payment-status.enum");
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estado inicial de la orden',
        enum: order_status_enum_1.OrderStatus,
        example: order_status_enum_1.OrderStatus.UNASSIGNED,
    }),
    (0, class_validator_1.IsEnum)(order_status_enum_1.OrderStatus),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Monto total de la orden',
        minimum: 0,
        example: 123.45,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Moneda de la transacción (código ISO de 3 caracteres)',
        minLength: 3,
        maxLength: 3,
        example: 'USD',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Línea principal de la dirección de entrega',
        maxLength: 255,
        example: 'Calle 123 #45-67',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "address1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Segunda línea de la dirección (opcional)',
        maxLength: 255,
        example: 'Apartamento 5B',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "address2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ciudad de entrega',
        maxLength: 100,
        example: 'Bogotá',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Departamento/estado de entrega',
        maxLength: 100,
        example: 'Cundinamarca',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Código postal o ZIP',
        minimum: 0,
        example: 110111,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Instrucciones adicionales para la entrega',
        maxLength: 500,
        example: 'Dejar en la portería si no hay nadie.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "instructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Método de pago utilizado',
        enum: payment_method_enum_1.PaymentMethod,
        example: payment_method_enum_1.PaymentMethod.CREDIT_CARD,
    }),
    (0, class_validator_1.IsEnum)(payment_method_enum_1.PaymentMethod),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estado del pago',
        enum: payment_status_enum_1.PaymentStatus,
        example: payment_status_enum_1.PaymentStatus.PENDING,
    }),
    (0, class_validator_1.IsEnum)(payment_status_enum_1.PaymentStatus),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentStatus", void 0);
//# sourceMappingURL=create-order.dto.js.map