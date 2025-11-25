const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("Auth Service", () => {
  test("hash de senha deve ser válido", async () => {
    const senha = "teste123";
    const hash = await bcrypt.hash(senha, 10);
    expect(hash).toBeDefined();
  });

  test("token JWT deve ser válido", () => {
    const token = jwt.sign({ id: 1 }, "troca_secret");
    const decoded = jwt.verify(token, "troca_secret");
    expect(decoded.id).toBe(1);
  });
});
