import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { changeIncidentStatus } from "../../src/application/incidents/changeIncidentStatus";
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
    } finally {
      reopenedRepository.close();
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
