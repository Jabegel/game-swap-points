const bcrypt = require("bcrypt");

describe("Password Utils", () => {
  test("comparação de senha deve funcionar", async () => {
    const senha = "senha123";
    const hash = await bcrypt.hash(senha, 10);
    const ok = await bcrypt.compare(senha, hash);
    expect(ok).toBe(true);
  });

  test("hash deve ser diferente da senha original", async () => {
    const senha = "abc123";
    const hash = await bcrypt.hash(senha, 10);
    expect(hash).not.toBe(senha);
  });
});
