import { expect, test } from "@playwright/test";
import { once } from "node:events";
import type { Server } from "node:http";
import { resolve } from "node:path";
import { createProductionApp } from "../../src/server/createProductionApp";
import { SqliteIncidentRepository } from "../../src/infrastructure/sqlite/SqliteIncidentRepository";

let server: Server;
let baseUrl: string;
let repository: SqliteIncidentRepository;

test.beforeAll(async () => {
  repository = new SqliteIncidentRepository(":memory:");
  repository.seedInitialData();
  server = createProductionApp(repository, resolve(process.cwd(), "dist")).listen(0);
  await once(server, "listening");
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("O servidor de teste não informou uma porta TCP.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  repository.close();
  await new Promise<void>((resolveServer) => server.close(() => resolveServer()));
});

test("carrega o dashboard com métricas e dados reais", async ({ page }) => {
  await page.goto(baseUrl);

  await expect(page.getByText("INCIDENTES ABERTOS")).toBeVisible();
  await expect(page.locator(".metric").filter({ hasText: "INCIDENTES ABERTOS" })).toContainText("2");
  await expect(page.getByRole("link", { name: "Payment API instability", exact: true })).toBeVisible();
  await expect(page.getByText("Open (New)").first()).toBeVisible();
});

test("filtra a tabela sem alterar os dados persistidos", async ({ page }) => {
  await page.goto(`${baseUrl}/incidents`);

  await page.getByLabel("Buscar por título").fill("Payment API");
  await expect(page.getByRole("link", { name: "Payment API instability", exact: true })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(1);

  await page.getByLabel("Filtrar por severidade").selectOption("High");
  await expect(page.getByText("Não há incidentes para exibir.")).toBeVisible();
});

test("orienta o incidente Critical aberto para a única próxima transição válida", async ({ page }) => {
  await page.goto(`${baseUrl}/incidents/seed-payment-api`);

  await expect(page.getByText("Open (New)").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Mover para In Progress" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Marcar como Resolved" })).toHaveCount(0);
});

test("cria um incidente pela interface e abre seus detalhes", async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "Novo incidente" }).click();

  await page.getByLabel(/Título/).fill("Portal de parceiros indisponível");
  await page.getByLabel(/Descrição/).fill("A equipe parceira não consegue acessar o portal.");
  await page.getByLabel(/Severidade/).selectOption("High");
  await page.getByLabel(/Responsável/).fill("Diego");
  await page.getByRole("button", { name: "Criar incidente" }).click();

  await expect(page).toHaveURL(/\/incidents\//);
  await expect(page.getByRole("heading", { name: "Portal de parceiros indisponível" })).toBeVisible();
  await expect(page.getByText("Open (New)").first()).toBeVisible();
});

test("persiste comentário e atualiza a timeline pela interface", async ({ page }) => {
  await page.goto(`${baseUrl}/incidents/seed-reconciliation-delay`);

  await page.getByPlaceholder("Seu nome").fill("Fernanda");
  await page.getByPlaceholder("Escreva uma atualização para a equipe...").fill("Conferindo os arquivos de reconciliação.");
  await page.getByRole("button", { name: "Adicionar comentário" }).click();

  await expect(page.getByText("Comentário adicionado com sucesso.")).toBeVisible();
  await expect(page.getByText("Fernanda comentou")).toBeVisible();
  await expect(page.getByText("Conferindo os arquivos de reconciliação.")).toBeVisible();
});

test("altera o status de um Critical seguindo a transição permitida", async ({ page }) => {
  await page.goto(`${baseUrl}/incidents/seed-payment-api`);
  await page.getByRole("button", { name: "Mover para In Progress" }).click();

  await expect(page.getByText("Status atualizado com sucesso.")).toBeVisible();
  await expect(page.locator(".status-in-progress").first()).toHaveText("In Progress");
  await expect(page.getByRole("button", { name: "Marcar como Resolved" })).toBeVisible();
});

test("mantém navegação e ações acessíveis em viewport móvel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Incidents" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Novo incidente" })).toBeVisible();
  await expect(page.getByLabel("Buscar por título")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
