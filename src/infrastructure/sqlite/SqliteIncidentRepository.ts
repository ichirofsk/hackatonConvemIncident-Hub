import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";
import type { Incident, IncidentComment, IncidentStatus, Severity, StatusHistoryEntry } from "../../domain/incident/incident";

type IncidentRow = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  owner: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
};

type StatusHistoryRow = {
  id: string;
  incident_id: string;
  previous_status: IncidentStatus;
  next_status: IncidentStatus;
  changed_at: string;
};

type IncidentCommentRow = {
  id: string;
  incident_id: string;
  author: string;
  content: string;
  created_at: string;
};

function toIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    owner: row.owner,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toStatusHistoryEntry(row: StatusHistoryRow): StatusHistoryEntry {
  return {
    id: row.id,
    incidentId: row.incident_id,
    previousStatus: row.previous_status,
    nextStatus: row.next_status,
    changedAt: row.changed_at,
  };
}

function toIncidentComment(row: IncidentCommentRow): IncidentComment {
  return {
    id: row.id,
    incidentId: row.incident_id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}

export class SqliteIncidentRepository implements IncidentRepository {
  private readonly database: DatabaseSync;

  constructor(databasePath = "data/incident-hub.db") {
    if (databasePath !== ":memory:") {
      mkdirSync(dirname(databasePath), { recursive: true });
    }

    this.database = new DatabaseSync(databasePath);
    this.migrate();
  }

  findById(id: string): Incident | undefined {
    const row = this.database
      .prepare("SELECT * FROM incidents WHERE id = ?")
      .get(id) as IncidentRow | undefined;

    return row ? toIncident(row) : undefined;
  }

  list(): Incident[] {
    return (this.database.prepare("SELECT * FROM incidents ORDER BY created_at DESC").all() as IncidentRow[]).map(toIncident);
  }

  create(incident: Incident): void {
    this.database
      .prepare(
        `INSERT INTO incidents (id, title, description, severity, owner, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        incident.id,
        incident.title,
        incident.description,
        incident.severity,
        incident.owner,
        incident.status,
        incident.createdAt,
        incident.updatedAt,
      );
  }

  updateStatus(
    incidentId: string,
    previousStatus: IncidentStatus,
    nextStatus: IncidentStatus,
    changedAt: string,
  ): Incident {
    this.database.exec("BEGIN");

    try {
      const result = this.database
        .prepare("UPDATE incidents SET status = ?, updated_at = ? WHERE id = ? AND status = ?")
        .run(nextStatus, changedAt, incidentId, previousStatus);

      if (result.changes !== 1) {
        throw new Error(`Não foi possível alterar o status do incidente ${incidentId}.`);
      }

      this.database
        .prepare(
          `INSERT INTO status_history (id, incident_id, previous_status, next_status, changed_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(randomUUID(), incidentId, previousStatus, nextStatus, changedAt);

      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }

    const updatedIncident = this.findById(incidentId);

    if (!updatedIncident) {
      throw new Error(`Incidente ${incidentId} não encontrado após a atualização.`);
    }

    return updatedIncident;
  }

  getStatusHistory(incidentId: string): StatusHistoryEntry[] {
    return (
      this.database
        .prepare("SELECT * FROM status_history WHERE incident_id = ? ORDER BY changed_at ASC")
        .all(incidentId) as StatusHistoryRow[]
    ).map(toStatusHistoryEntry);
  }

  createComment(comment: IncidentComment): void {
    this.database
      .prepare(
        `INSERT INTO incident_comments (id, incident_id, author, content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(comment.id, comment.incidentId, comment.author, comment.content, comment.createdAt);
  }

  getComments(incidentId: string): IncidentComment[] {
    return (
      this.database
        .prepare("SELECT * FROM incident_comments WHERE incident_id = ? ORDER BY created_at ASC, id ASC")
        .all(incidentId) as IncidentCommentRow[]
    ).map(toIncidentComment);
  }

  seedInitialData(): void {
    const initialIncidents: Incident[] = [
      {
        id: "seed-payment-api",
        title: "Payment API instability",
        description: "Instabilidade identificada na API de pagamentos.",
        severity: "Critical",
        owner: "Ana",
        status: "Open",
        createdAt: "2026-09-05T12:01:00.000Z",
        updatedAt: "2026-09-05T12:01:00.000Z",
      },
      {
        id: "seed-reconciliation-delay",
        title: "Reconciliation delay",
        description: "A reconciliação está com atraso acima do esperado.",
        severity: "High",
        owner: "Bruno",
        status: "In Progress",
        createdAt: "2026-09-05T12:02:00.000Z",
        updatedAt: "2026-09-05T12:12:00.000Z",
      },
      {
        id: "seed-incorrect-customer-notification",
        title: "Incorrect customer notification",
        description: "Uma notificação incorreta foi enviada a clientes.",
        severity: "Medium",
        owner: "Carla",
        status: "Resolved",
        createdAt: "2026-09-05T12:03:00.000Z",
        updatedAt: "2026-09-05T12:23:00.000Z",
      },
    ];

    const insertIncident = this.database.prepare(
      `INSERT OR IGNORE INTO incidents (id, title, description, severity, owner, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const incident of initialIncidents) {
      insertIncident.run(
        incident.id,
        incident.title,
        incident.description,
        incident.severity,
        incident.owner,
        incident.status,
        incident.createdAt,
        incident.updatedAt,
      );
    }
  }

  close(): void {
    this.database.close();
  }

  private migrate(): void {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
        owner TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS status_history (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL REFERENCES incidents(id),
        previous_status TEXT NOT NULL,
        next_status TEXT NOT NULL,
        changed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS incident_comments (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL REFERENCES incidents(id),
        author TEXT NOT NULL CHECK (length(trim(author)) > 0),
        content TEXT NOT NULL CHECK (length(trim(content)) > 0),
        created_at TEXT NOT NULL
      );
    `);
  }
}
