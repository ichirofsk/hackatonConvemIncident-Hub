import type { Incident, IncidentStatus, StatusHistoryEntry } from "./incident";

export interface IncidentRepository {
  findById(id: string): Incident | undefined;
  list(): Incident[];
  create(incident: Incident): void;
  updateStatus(
    incidentId: string,
    previousStatus: IncidentStatus,
    nextStatus: IncidentStatus,
    changedAt: string,
  ): Incident;
  getStatusHistory(incidentId: string): StatusHistoryEntry[];
  seedInitialData(): void;
  close(): void;
}
