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
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const update_assignment_dto_1 = require("./dto/update-assignment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const assignment_entity_1 = require("./entities/assignment.entity");
let AssignmentsController = class AssignmentsController {
    constructor(assignmentService) {
        this.assignmentService = assignmentService;
    }
    create(createAssignmentDto) {
        return this.assignmentService.create(createAssignmentDto);
    }
    findAll() {
        return this.assignmentService.findAll();
    }
    findOne(id) {
        return this.assignmentService.findOne(id);
    }
    update(id, updateAssignmentDto) {
        return this.assignmentService.update(id, updateAssignmentDto);
    }
    remove(id) {
        return this.assignmentService.remove(id);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo assignment' }),
    (0, swagger_1.ApiBody)({ type: create_assignment_dto_1.CreateAssignmentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'assignment creado', type: assignment_entity_1.Assignment }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los assignments' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Listado de assignments',
        type: [assignment_entity_1.Assignment],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un assignment por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'ID del assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'assignment encontrado', type: assignment_entity_1.Assignment }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un assignment existente' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'ID del assignment' }),
    (0, swagger_1.ApiBody)({ type: update_assignment_dto_1.UpdateAssignmentDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'assignment actualizado',
        type: assignment_entity_1.Assignment,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_assignment_dto_1.UpdateAssignmentDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un assignment' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'ID del assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'assignment eliminado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "remove", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('Assignment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('assignment'),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map