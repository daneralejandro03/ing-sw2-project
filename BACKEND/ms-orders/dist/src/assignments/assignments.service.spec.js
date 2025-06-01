"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const assignments_service_1 = require("./assignments.service");
describe('AssignmentsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [assignments_service_1.AssignmentsService],
        }).compile();
        service = module.get(assignments_service_1.AssignmentsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=assignments.service.spec.js.map