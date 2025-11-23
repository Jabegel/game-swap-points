describe("Loan Creation UI", () => {
  it("Deve criar um empréstimo pelo front", () => {
    cy.visit("/loans");
    cy.get("select[name=user]").select("1");
    cy.get("select[name=game]").select("2");
    cy.get("button#create-loan").click();
    cy.contains("Empréstimo criado").should("exist");
  });
});