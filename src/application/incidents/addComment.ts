import { randomUUID } from "node:crypto";
import type { IncidentComment } from "../../domain/incident/incident";
import type { IncidentRepository } from "../../domain/incident/IncidentRepository";
import { IncidentNotFoundError } from "./changeIncidentStatus";

export function addComment(
  repository: IncidentRepository,
  incidentId: string,
  author: string,
  content: string,
  createdAt: string,
): IncidentComment {
  if (!repository.findById(incidentId)) {
    throw new IncidentNotFoundError(incidentId);
  }

  const comment: IncidentComment = {
    id: randomUUID(),
    incidentId,
    author,
    content,
    createdAt,
  };

  repository.createComment(comment);
  return comment;
}
