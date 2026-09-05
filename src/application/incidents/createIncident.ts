import { randomUUID } from "node:crypto";
import type { Incident, Severity } from "../../domain/incident/incident";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";

export interface CreateIncidentInput {
  title: string;
  description: string;
  severity: Severity;
  owner: string;
}

export function createIncident(
  repository: IncidentRepository,
  input: CreateIncidentInput,
  createdAt: string,
): Incident {
  const incident: Incident = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    severity: input.severity,
    owner: input.owner,
    status: "Open",
    createdAt,
    updatedAt: createdAt,
  };

  repository.create(incident);
  return incident;
}
