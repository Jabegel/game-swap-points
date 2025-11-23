describe("Login UI", () => {
  it("Deve fazer login com credenciais válidas", () => {
    cy.visit("/");
    cy.get("input[name=email]").type("admin@admin.com");
    cy.get("input[name=senha]").type("123456");
    cy.get("button[type=submit]").click();
    cy.contains("Bem vindo").should("exist");
  });
});