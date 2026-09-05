import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { changeIncidentStatus } from "../../src/application/incidents/changeIncidentStatus";
import { addComment } from "../../src/application/incidents/addComment";
import { InvalidStatusTransitionError } from "../../src/domain/incident/statusTransition";
import { SqliteIncidentRepository } from "../../src/infrastructure/sqlite/SqliteIncidentRepository";

describe("SqliteIncidentRepository", () => {
  it("creates the required seed incidents idempotently", () => {
    const repository = new SqliteIncidentRepository(":memory:");

    try {
      repository.seedInitialData();
      repository.seedInitialData();

      const incidents = repository.list();

      expect(incidents).toHaveLength(3);
      expect(repository.findById("seed-payment-api")).toMatchObject({
        title: "Payment API instability",
        severity: "Critical",
        owner: "Ana",
        status: "Open",
      });
      expect(repository.findById("seed-reconciliation-delay")).toMatchObject({
        status: "In Progress",
      });
      expect(repository.findById("seed-incorrect-customer-notification")).toMatchObject({
        status: "Resolved",
      });
    } finally {
      repository.close();
    }
  });

  it("persists permitted status changes and records their history", () => {
    const repository = new SqliteIncidentRepository(":memory:");

    try {
      repository.seedInitialData();

      const updatedIncident = changeIncidentStatus(
        repository,
        "seed-payment-api",
        "In Progress",
        "2026-09-05T12:30:00.000Z",
      );

      expect(updatedIncident.status).toBe("In Progress");
      expect(repository.getStatusHistory("seed-payment-api")).toMatchObject([
        {
          incidentId: "seed-payment-api",
          previousStatus: "Open",
          nextStatus: "In Progress",
          changedAt: "2026-09-05T12:30:00.000Z",
        },
      ]);
    } finally {
      repository.close();
    }
  });

  it("does not persist an invalid Critical transition", () => {
    const repository = new SqliteIncidentRepository(":memory:");

    try {
      repository.seedInitialData();

      expect(() =>
        changeIncidentStatus(repository, "seed-payment-api", "Resolved", "2026-09-05T12:30:00.000Z"),
      ).toThrow(InvalidStatusTransitionError);

      expect(repository.findById("seed-payment-api")?.status).toBe("Open");
      expect(repository.getStatusHistory("seed-payment-api")).toHaveLength(0);
    } finally {
      repository.close();
    }
  });

  it("retains seed data after reopening a file-backed database", () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), "incident-hub-"));
    const databasePath = join(temporaryDirectory, "incident-hub.db");
    const firstRepository = new SqliteIncidentRepository(databasePath);

    firstRepository.seedInitialData();
    changeIncidentStatus(
      firstRepository,
      "seed-payment-api",
      "In Progress",
      "2026-09-05T12:30:00.000Z",
    );
    addComment(
      firstRepository,
      "seed-payment-api",
      "Ana",
      "Contato iniciado com o provedor.",
      "2026-09-05T12:35:00.000Z",
    );
    firstRepository.close();

    const reopenedRepository = new SqliteIncidentRepository(databasePath);

    try {
      expect(reopenedRepository.list()).toHaveLength(3);
      expect(reopenedRepository.findById("seed-payment-api")).toMatchObject({
        title: "Payment API instability",
        status: "In Progress",
        updatedAt: "2026-09-05T12:30:00.000Z",
      });
      expect(reopenedRepository.getStatusHistory("seed-payment-api")).toMatchObject([
        {
          previousStatus: "Open",
          nextStatus: "In Progress",
          changedAt: "2026-09-05T12:30:00.000Z",
        },
      ]);
      expect(reopenedRepository.getComments("seed-payment-api")).toMatchObject([
        {
          author: "Ana",
          content: "Contato iniciado com o provedor.",
          createdAt: "2026-09-05T12:35:00.000Z",
        },
      ]);
    } finally {
      reopenedRepository.close();
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("adds comments support when opening a database created before the change request", () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), "incident-hub-legacy-"));
    const databasePath = join(temporaryDirectory, "incident-hub.db");
    const legacyDatabase = new DatabaseSync(databasePath);

    legacyDatabase.exec(`
      CREATE TABLE incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        owner TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE status_history (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        previous_status TEXT NOT NULL,
        next_status TEXT NOT NULL,
        changed_at TEXT NOT NULL
      );
      INSERT INTO incidents VALUES (
        'legacy-incident', 'Legacy incident', 'Created before comments', 'High', 'Bruno', 'Open',
        '2026-09-05T12:00:00.000Z', '2026-09-05T12:00:00.000Z'
      );
    `);
    legacyDatabase.close();

    const repository = new SqliteIncidentRepository(databasePath);

    try {
      expect(repository.findById("legacy-incident")?.title).toBe("Legacy incident");
      addComment(
        repository,
        "legacy-incident",
        "Bruno",
        "Comentário incluído após a atualização.",
        "2026-09-05T12:10:00.000Z",
      );
      expect(repository.getComments("legacy-incident")).toHaveLength(1);
    } finally {
      repository.close();
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("rolls back the incident update when history persistence fails", () => {
    const repository = new SqliteIncidentRepository(":memory:");
    const database = (repository as unknown as { database: DatabaseSync }).database;

    try {
      repository.seedInitialData();
      database.exec(`
        CREATE TRIGGER fail_status_history
        BEFORE INSERT ON status_history
        BEGIN
          SELECT RAISE(ABORT, 'simulated history persistence failure');
        END;
      `);

      expect(() =>
        changeIncidentStatus(repository, "seed-payment-api", "In Progress", "2026-09-05T12:30:00.000Z"),
      ).toThrow("simulated history persistence failure");

      expect(repository.findById("seed-payment-api")?.status).toBe("Open");
      expect(repository.getStatusHistory("seed-payment-api")).toHaveLength(0);
    } finally {
      repository.close();
    }
  });
});
