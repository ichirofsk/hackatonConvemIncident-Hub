import type { Incident, IncidentStatus } from "../../domain/incident/incident";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";
import { assertStatusTransition } from "../../domain/incident/statusTransition";

export class IncidentNotFoundError extends Error {
  constructor(incidentId: string) {
    super(`Incidente ${incidentId} não encontrado.`);
    this.name = "IncidentNotFoundError";
  }
}

export function changeIncidentStatus(
  repository: IncidentRepository,
  incidentId: string,
  nextStatus: IncidentStatus,
  changedAt: string,
): Incident {
  const incident = repository.findById(incidentId);

  if (!incident) {
    throw new IncidentNotFoundError(incidentId);
  }

  assertStatusTransition(incident.severity, incident.status, nextStatus);

  return repository.updateStatus(incident.id, incident.status, nextStatus, changedAt);
}
