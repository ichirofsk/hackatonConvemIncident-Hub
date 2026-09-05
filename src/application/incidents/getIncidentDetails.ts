import type { Incident, StatusHistoryEntry } from "../../domain/incident/incident";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";
import { IncidentNotFoundError } from "./changeIncidentStatus";

export interface IncidentDetails {
  incident: Incident;
  history: StatusHistoryEntry[];
}

export function getIncidentDetails(repository: IncidentRepository, incidentId: string): IncidentDetails {
  const incident = repository.findById(incidentId);

  if (!incident) {
    throw new IncidentNotFoundError(incidentId);
  }

  return { incident, history: repository.getStatusHistory(incidentId) };
}
