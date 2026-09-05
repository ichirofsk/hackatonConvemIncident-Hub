import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { SqliteIncidentRepository } from "../../src/infrastructure/sqlite/SqliteIncidentRepository";
import { createProductionApp } from "../../src/server/createProductionApp";

describe("production application", () => {
  const directories: string[] = [];

  afterEach(() => directories.forEach((directory) => rmSync(directory, { recursive: true, force: true })));

  it("serves the client entry point for interface routes while preserving API routes", async () => {
    const clientBuildPath = mkdtempSync(join(tmpdir(), "incident-hub-client-"));
    directories.push(clientBuildPath);
    writeFileSync(join(clientBuildPath, "index.html"), "<main>Incident Hub client</main>");
    const repository = new SqliteIncidentRepository(":memory:");
    repository.seedInitialData();
    const app = createProductionApp(repository, clientBuildPath);

    const clientResponse = await request(app).get("/incidents/seed-payment-api");
    const apiResponse = await request(app).get("/api/dashboard");

    expect(clientResponse.status).toBe(200);
    expect(clientResponse.text).toContain("Incident Hub client");
    expect(apiResponse.body).toEqual({ openIncidents: 2, unresolvedCriticalIncidents: 1, resolvedIncidents: 1 });
    repository.close();
  });
});
