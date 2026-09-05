export const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;
export const INCIDENT_STATUSES = ["Open", "In Progress", "Resolved"] as const;

export type Severity = (typeof SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  owner: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  incidentId: string;
  previousStatus: IncidentStatus;
  nextStatus: IncidentStatus;
  changedAt: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  author: string;
  content: string;
  createdAt: string;
}

export type IncidentActivity =
  | {
      type: "status-change";
      id: string;
      occurredAt: string;
      previousStatus: IncidentStatus;
      nextStatus: IncidentStatus;
    }
  | {
      type: "comment";
      id: string;
      occurredAt: string;
      author: string;
      content: string;
    };
