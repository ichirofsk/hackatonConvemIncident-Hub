import express, { type NextFunction, type Request, type Response } from "express";
import { changeIncidentStatus, IncidentNotFoundError } from "../application/incidents/changeIncidentStatus";
import { addComment } from "../application/incidents/addComment";
import { createIncident } from "../application/incidents/createIncident";
import { getDashboardMetrics } from "../application/incidents/getDashboardMetrics";
import { getIncidentDetails } from "../application/incidents/getIncidentDetails";
import { getIncidentActivity } from "../application/incidents/getIncidentActivity";
import { listIncidents } from "../application/incidents/listIncidents";
import type { IncidentRepository } from "../domain/incident/IncidentRepository";
import { INCIDENT_STATUSES, SEVERITIES, type IncidentStatus, type Severity } from "../domain/incident/incident";
import { InvalidStatusTransitionError } from "../domain/incident/statusTransition";

function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && (SEVERITIES as readonly string[]).includes(value);
}

function isIncidentStatus(value: unknown): value is IncidentStatus {
  return typeof value === "string" && (INCIDENT_STATUSES as readonly string[]).includes(value);
}

function requiredText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function createApp(repository: IncidentRepository, now = () => new Date().toISOString()) {
  const app = express();

  app.use(express.json());

  app.get("/api/incidents", (request, response) => {
    const { status, severity } = request.query;

    if (status !== undefined && !isIncidentStatus(status)) {
      response.status(400).json({ error: "Status de filtro inválido." });
      return;
    }

    if (severity !== undefined && !isSeverity(severity)) {
      response.status(400).json({ error: "Severidade de filtro inválida." });
      return;
    }

    response.json({ items: listIncidents(repository, { status, severity }) });
  });

  app.post("/api/incidents", (request, response) => {
    const title = requiredText(request.body?.title);
    const description = requiredText(request.body?.description);
    const owner = requiredText(request.body?.owner);
    const { severity } = request.body ?? {};
    const invalidFields: string[] = [];

    if (!title) invalidFields.push("title");
    if (!description) invalidFields.push("description");
    if (!isSeverity(severity)) invalidFields.push("severity");
    if (!owner) invalidFields.push("owner");

    if (invalidFields.length > 0) {
      response.status(400).json({ error: "Campos obrigatórios inválidos.", fields: invalidFields });
      return;
    }

    const incident = createIncident(
      repository,
      {
        title: title!,
        description: description!,
        severity: severity as Severity,
        owner: owner!,
      },
      now(),
    );
    response.status(201).json(incident);
  });

  app.get("/api/incidents/:incidentId", (request, response, next) => {
    try {
      response.json(getIncidentDetails(repository, request.params.incidentId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/incidents/:incidentId/history", (request, response, next) => {
    try {
      const details = getIncidentDetails(repository, request.params.incidentId);
      response.json({ items: details.history });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/incidents/:incidentId/activity", (request, response, next) => {
    try {
      response.json({ items: getIncidentActivity(repository, request.params.incidentId) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/incidents/:incidentId/comments", (request, response, next) => {
    const author = requiredText(request.body?.author);
    const content = requiredText(request.body?.content);
    const invalidFields: string[] = [];

    if (!author) invalidFields.push("author");
    if (!content) invalidFields.push("content");

    if (invalidFields.length > 0) {
      response.status(400).json({ error: "Campos obrigatórios inválidos.", fields: invalidFields });
      return;
    }

    try {
      response.status(201).json(addComment(repository, request.params.incidentId, author!, content!, now()));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/incidents/:incidentId/status", (request, response, next) => {
    const { status } = request.body ?? {};

    if (!isIncidentStatus(status)) {
      response.status(400).json({ error: "Status inválido." });
      return;
    }

    try {
      response.json(changeIncidentStatus(repository, request.params.incidentId, status, now()));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/dashboard", (_request, response) => {
    response.json(getDashboardMetrics(repository));
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError && "status" in error && error.status === 400) {
      response.status(400).json({ error: "Corpo JSON inválido." });
      return;
    }

    if (error instanceof IncidentNotFoundError) {
      response.status(404).json({ error: error.message });
      return;
    }

    if (error instanceof InvalidStatusTransitionError) {
      response.status(422).json({ error: error.message });
      return;
    }

    response.status(500).json({ error: "Erro interno ao processar a solicitação." });
  });

  return app;
}
