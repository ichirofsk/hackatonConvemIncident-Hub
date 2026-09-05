import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { SqliteIncidentRepository } from "../../src/infrastructure/sqlite/SqliteIncidentRepository";
import { createApp } from "../../src/server/createApp";

describe("Incident Hub API", () => {
  let repository: SqliteIncidentRepository;

  beforeEach(() => {
    repository = new SqliteIncidentRepository(":memory:");
    repository.seedInitialData();
  });

  it("lists incidents and applies status and severity filters", async () => {
    const app = createApp(repository, () => "2026-09-05T13:00:00.000Z");

    const response = await request(app).get("/api/incidents?status=Open&severity=Critical");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      id: "seed-payment-api",
      status: "Open",
      severity: "Critical",
    });
  });

  it("rejects invalid filters and invalid create payloads", async () => {
    const app = createApp(repository);

    const invalidFilter = await request(app).get("/api/incidents?severity=Urgent");
    const invalidCreate = await request(app).post("/api/incidents").send({ title: " " });

    expect(invalidFilter.status).toBe(400);
    expect(invalidCreate.status).toBe(400);
    expect(invalidCreate.body.fields).toEqual(expect.arrayContaining(["title", "description", "severity", "owner"]));
  });

  it("creates incidents with Open status and persists them", async () => {
    const app = createApp(repository, () => "2026-09-05T13:00:00.000Z");

    const createResponse = await request(app).post("/api/incidents").send({
      title: "Worker queue delay",
      description: "A fila de processamento está atrasada.",
      severity: "High",
      owner: "Diego",
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      title: "Worker queue delay",
      severity: "High",
      owner: "Diego",
      status: "Open",
      createdAt: "2026-09-05T13:00:00.000Z",
      updatedAt: "2026-09-05T13:00:00.000Z",
    });

    const detailsResponse = await request(app).get(`/api/incidents/${createResponse.body.id}`);
    expect(detailsResponse.status).toBe(200);
    expect(detailsResponse.body.incident.title).toBe("Worker queue delay");
  });

  it("returns incident details and status history", async () => {
    const app = createApp(repository, () => "2026-09-05T13:00:00.000Z");

    await request(app).patch("/api/incidents/seed-payment-api/status").send({ status: "In Progress" });
    const response = await request(app).get("/api/incidents/seed-payment-api");
    const historyResponse = await request(app).get("/api/incidents/seed-payment-api/history");

    expect(response.status).toBe(200);
    expect(response.body.incident.status).toBe("In Progress");
    expect(response.body.history).toMatchObject([
      { previousStatus: "Open", nextStatus: "In Progress" },
    ]);
    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.items).toMatchObject([
      { previousStatus: "Open", nextStatus: "In Progress" },
    ]);
  });

  it("rejects an invalid status payload and returns 404 for unknown incidents", async () => {
    const app = createApp(repository);

    const invalidStatus = await request(app)
      .patch("/api/incidents/seed-payment-api/status")
      .send({ status: "Closed" });
    const missingIncident = await request(app).get("/api/incidents/unknown-incident");

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.error).toBe("Status inválido.");
    expect(missingIncident.status).toBe(404);
    expect(missingIncident.body.error).toContain("não encontrado");
  });

  it("returns understandable feedback for malformed JSON", async () => {
    const app = createApp(repository);

    const response = await request(app)
      .post("/api/incidents")
      .set("Content-Type", "application/json")
      .send("{ invalid json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Corpo JSON inválido." });
  });

  it("returns understandable feedback and preserves data on an invalid Critical transition", async () => {
    const app = createApp(repository);

    const changeResponse = await request(app)
      .patch("/api/incidents/seed-payment-api/status")
      .send({ status: "Resolved" });
    const detailsResponse = await request(app).get("/api/incidents/seed-payment-api");

    expect(changeResponse.status).toBe(422);
    expect(changeResponse.body.error).toContain("não é permitida");
    expect(detailsResponse.body.incident.status).toBe("Open");
    expect(detailsResponse.body.history).toHaveLength(0);
  });

  it("returns current dashboard metrics", async () => {
    const app = createApp(repository);

    const response = await request(app).get("/api/dashboard");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      openIncidents: 1,
      unresolvedCriticalIncidents: 1,
      resolvedIncidents: 1,
    });
  });
});
