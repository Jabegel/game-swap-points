describe("Games Service - Unit Tests", () => {
    const mockDB = {
        getGameById: jest.fn(),
        listGames: jest.fn(),
    };

    test("Deve retornar um jogo pelo ID", async () => {
        mockDB.getGameById.mockResolvedValue({ id: 1, title: "Zelda" });
        const game = await mockDB.getGameById(1);
        expect(game).toHaveProperty("title", "Zelda");
    });

    test("Deve retornar lista de jogos", async () => {
        mockDB.listGames.mockResolvedValue([
            { id: 1, title: "Zelda" },
            { id: 2, title: "Mario" }
        ]);
        const games = await mockDB.listGames();
        expect(games.length).toBeGreaterThan(1);
    });
});