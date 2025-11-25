const request = require("supertest");
const app = require("../../server");

describe("API POST Login", () => {
  test("POST /login deve retornar token", async () => {
    const body = { email:"admin@teste.com", password:"123456" };
    const res = await request(app).post("/login").send(body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
