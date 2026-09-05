import { SqliteIncidentRepository } from "../infrastructure/sqlite/SqliteIncidentRepository";
import { createApp } from "./createApp";
import { createProductionApp } from "./createProductionApp";

const port = Number(process.env.PORT ?? 3000);
const repository = new SqliteIncidentRepository(process.env.DATABASE_PATH ?? "data/incident-hub.db");

repository.seedInitialData();

const app = createProductionApp(repository);

app.listen(port, () => {
  console.log(`Incident Hub disponível em http://localhost:${port}`);
});
