"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const assignments_controller_1 = require("./assignments.controller");
describe('AssignmentsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [assignments_controller_1.AssignmentsController],
        }).compile();
        controller = module.get(assignments_controller_1.AssignmentsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=assignments.controller.spec.js.map