"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const items_controller_1 = require("./items.controller");
describe('ItemsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [items_controller_1.ItemsController],
        }).compile();
        controller = module.get(items_controller_1.ItemsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=items.controller.spec.js.map