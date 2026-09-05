import type { IncidentActivity } from "../../domain/incident/incident";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";
import { IncidentNotFoundError } from "./changeIncidentStatus";

export function getIncidentActivity(repository: IncidentRepository, incidentId: string): IncidentActivity[] {
  if (!repository.findById(incidentId)) {
    throw new IncidentNotFoundError(incidentId);
  }

  const activity: IncidentActivity[] = [
    ...repository.getStatusHistory(incidentId).map((entry) => ({
      type: "status-change" as const,
      id: entry.id,
      occurredAt: entry.changedAt,
      previousStatus: entry.previousStatus,
      nextStatus: entry.nextStatus,
    })),
    ...repository.getComments(incidentId).map((comment) => ({
      type: "comment" as const,
      id: comment.id,
      occurredAt: comment.createdAt,
      author: comment.author,
      content: comment.content,
    })),
  ];

  return activity.sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) || left.id.localeCompare(right.id));
}
