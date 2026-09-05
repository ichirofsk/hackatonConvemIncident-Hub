import type { IncidentRepository } from "../../domain/incident/IncidentRepository";

export interface DashboardMetrics {
  openIncidents: number;
  unresolvedCriticalIncidents: number;
  resolvedIncidents: number;
}

export function getDashboardMetrics(repository: IncidentRepository): DashboardMetrics {
  const incidents = repository.list();

  return {
    openIncidents: incidents.filter((incident) => incident.status === "Open").length,
    unresolvedCriticalIncidents: incidents.filter(
      (incident) => incident.severity === "Critical" && incident.status !== "Resolved",
    ).length,
    resolvedIncidents: incidents.filter((incident) => incident.status === "Resolved").length,
  };
}
