const bcrypt = require("bcrypt");

describe("User Service - Unit Tests", () => {
    test("Deve gerar hash corretamente", async () => {
        const senha = "123456";
        const hash = await bcrypt.hash(senha, 10);
        expect(hash).toBeDefined();
        expect(hash).not.toBe(senha);
    });

    test("Deve comparar hash corretamente", async () => {
        const senha = "abc123";
        const hash = await bcrypt.hash(senha, 10);
        const valido = await bcrypt.compare(senha, hash);
        expect(valido).toBe(true);
    });
});