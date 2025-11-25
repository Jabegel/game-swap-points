const request = require("supertest");
const app = require("../../server");

describe("API GET Users", () => {
  test("GET /users deve retornar lista", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
