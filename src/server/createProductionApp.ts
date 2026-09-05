import express from "express";
import { resolve } from "node:path";
import type { IncidentRepository } from "../domain/incident/IncidentRepository";
import { createApp } from "./createApp";

export function createProductionApp(repository: IncidentRepository, clientBuildPath = resolve(process.cwd(), "dist")) {
  const app = createApp(repository);

  app.use(express.static(clientBuildPath));
  app.get("/{*splat}", (_request, response) => {
    response.sendFile(resolve(clientBuildPath, "index.html"));
  });

  return app;
}
