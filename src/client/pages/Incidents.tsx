import { api } from "../api";
import { IncidentTable } from "../components/IncidentTable";
import { EmptyState } from "../components/States";
import { useData } from "../hooks/useData";

export function Incidents() {
  const incidents = useData(() => api.list());
  if (incidents.error) return <EmptyState text={incidents.error} />;
  return <IncidentTable incidents={incidents.data?.items ?? []} />;
}
