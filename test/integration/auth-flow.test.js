const request = require("supertest");
const app = require("../../server");

describe("Auth Flow - Integration", () => {
    test("Fluxo completo de login", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@admin.com", senha: "123456" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });
});