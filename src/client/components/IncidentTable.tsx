import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Incident, Severity, Status } from "../api";
import { formatDate, statusLabel } from "../utils/presentation";
import { SeverityBadge, StatusBadge } from "./Badges";
import { EmptyState } from "./States";

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const items = useMemo(() => incidents.filter((incident) =>
    (!status || incident.status === status) && (!severity || incident.severity === severity) && incident.title.toLowerCase().includes(search.toLowerCase()),
  ), [incidents, status, severity, search]);

  return <section className="panel table-panel">
    <div className="section-title"><div><h2>Todos os incidentes</h2><p>Consulte, filtre e acompanhe cada registro.</p></div></div>
    <div className="filters">
      <input aria-label="Buscar por título" placeholder="Buscar por título..." value={search} onChange={(event) => setSearch(event.target.value)} />
      <select aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option>{(["Open", "In Progress", "Resolved"] as Status[]).map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select>
      <select aria-label="Filtrar por severidade" value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="">Todas as severidades</option>{(["Low", "Medium", "High", "Critical"] as Severity[]).map((value) => <option key={value}>{value}</option>)}</select>
    </div>
    {items.length ? <div className="table-wrap"><table><thead><tr><th>Título</th><th>Severidade</th><th>Responsável</th><th>Status</th><th>Criado em</th><th aria-label="Abrir detalhes" /></tr></thead><tbody>{items.map((incident) => <tr key={incident.id}><td><Link to={`/incidents/${incident.id}`}>{incident.title}</Link></td><td><SeverityBadge value={incident.severity} /></td><td>{incident.owner}</td><td><StatusBadge value={incident.status} /></td><td>{formatDate(incident.createdAt)}</td><td><Link to={`/incidents/${incident.id}`} aria-label={`Abrir ${incident.title}`}><ChevronRight /></Link></td></tr>)}</tbody></table></div> : <EmptyState text="Não há incidentes para exibir." />}
  </section>;
}
