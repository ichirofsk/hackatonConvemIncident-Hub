import { SqliteIncidentRepository } from "../infrastructure/sqlite/SqliteIncidentRepository";
import { createApp } from "./createApp";

const port = Number(process.env.PORT ?? 3000);
const repository = new SqliteIncidentRepository(process.env.DATABASE_PATH ?? "data/incident-hub.db");

repository.seedInitialData();

createApp(repository).listen(port, () => {
  console.log(`Incident Hub API disponível em http://localhost:${port}`);
});
