"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_auth_guard_1 = require("./jwt-auth.guard");
describe('JwtAuthGuard', () => {
    const mockJwtService = {};
    expect(new jwt_auth_guard_1.JwtAuthGuard(mockJwtService)).toBeDefined();
});
//# sourceMappingURL=jwt-auth.guard.spec.js.map