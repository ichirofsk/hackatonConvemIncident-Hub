import type { Incident, IncidentStatus, Severity } from "../../domain/incident/incident";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: Severity;
}

export function listIncidents(repository: IncidentRepository, filters: IncidentFilters = {}): Incident[] {
  return repository.list().filter((incident) => {
    const matchesStatus = !filters.status || incident.status === filters.status;
    const matchesSeverity = !filters.severity || incident.severity === filters.severity;

    return matchesStatus && matchesSeverity;
  });
}
