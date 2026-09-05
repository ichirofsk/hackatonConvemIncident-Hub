import type { IncidentStatus, Severity } from "./incident";

export class InvalidStatusTransitionError extends Error {
  constructor(currentStatus: IncidentStatus, nextStatus: IncidentStatus) {
    super(`A transição de ${currentStatus} para ${nextStatus} não é permitida para um incidente Critical.`);
    this.name = "InvalidStatusTransitionError";
  }
}

export function isStatusTransitionAllowed(
  severity: Severity,
  currentStatus: IncidentStatus,
  nextStatus: IncidentStatus,
): boolean {
  return !(severity === "Critical" && currentStatus === "Open" && nextStatus === "Resolved");
}

export function assertStatusTransition(
  severity: Severity,
  currentStatus: IncidentStatus,
  nextStatus: IncidentStatus,
): void {
  if (!isStatusTransitionAllowed(severity, currentStatus, nextStatus)) {
    throw new InvalidStatusTransitionError(currentStatus, nextStatus);
  }
}
