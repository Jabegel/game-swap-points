const request = require("supertest");
const app = require("../../server");

describe("Loans Relation - Integration", () => {
    test("Deve criar empréstimo e relacionar com usuário e jogo", async () => {
        const loan = await request(app)
            .post("/api/loans")
            .send({ userId: 1, gameId: 2, date: "2025-01-01" });
        expect(loan.statusCode).toBe(201);
        expect(loan.body).toHaveProperty("id");
    });
});