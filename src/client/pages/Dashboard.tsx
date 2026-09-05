import { AlertTriangle, CheckCircle2, ChevronRight, List, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { api, type Incident, type Severity, type Status } from "../api";
import { SeverityBadge, StatusBadge } from "../components/Badges";
import { IncidentTable } from "../components/IncidentTable";
import { EmptyState, LoadingState } from "../components/States";
import { useData } from "../hooks/useData";
import { formatDate, statusLabel } from "../utils/presentation";

export function Dashboard() {
  const metrics = useData(() => api.metrics());
  const incidents = useData(() => api.list());
  if (metrics.error || incidents.error) return <EmptyState text={metrics.error || incidents.error} />;
  if (!metrics.data || !incidents.data) return <LoadingState />;

  const items = incidents.data.items;
  const attention = items.filter((incident) => incident.status !== "Resolved");
  const cards = [["INCIDENTES ABERTOS", metrics.data.openIncidents, AlertTriangle], ["CRITICAL NÃO RESOLVIDOS", metrics.data.unresolvedCriticalIncidents, ShieldAlert], ["INCIDENTES RESOLVIDOS", metrics.data.resolvedIncidents, CheckCircle2]] as const;
  return <>
    <section className="metric-grid">{cards.map(([label, value, Icon]) => <article className="metric" key={label}><Icon /><small>{label}</small><strong>{value}</strong><span>Dados em tempo real</span></article>)}<article className="metric"><List /><small>TOTAL DE INCIDENTES</small><strong>{items.length}</strong><span>Base atual</span></article></section>
    <section className="dashboard-grid"><div className="panel"><div className="section-title"><div><h2>Incidentes que precisam de atenção</h2><p>Priorize os casos ainda não resolvidos.</p></div><Link to="/incidents">Ver todos <ChevronRight /></Link></div>{attention.length ? attention.map((incident) => <Link className={`attention ${incident.severity.toLowerCase()}`} key={incident.id} to={`/incidents/${incident.id}`}><div><SeverityBadge value={incident.severity} /><h3>{incident.title}</h3><p>{incident.owner} · Atualizado em {formatDate(incident.updatedAt)}</p></div><StatusBadge value={incident.status} /><ChevronRight /></Link>) : <EmptyState text="Não há incidentes que exigem atenção." />}</div><Distribution incidents={items} /></section>
    <IncidentTable incidents={items} />
  </>;
}

function Distribution({ incidents }: { incidents: Incident[] }) {
  return <div className="panel"><h2>Distribuição por severidade</h2><p>Incidentes na base atual.</p><div className="distribution">{(["Critical", "High", "Medium", "Low"] as Severity[]).map((value) => { const count = incidents.filter((incident) => incident.severity === value).length; return <div key={value}><span><i className={value.toLowerCase()} />{value}</span><b>{count}</b><em style={{ width: `${incidents.length ? count / incidents.length * 100 : 0}%` }} /></div>; })}</div><h3>Incidentes por status</h3><div className="distribution">{(["Open", "In Progress", "Resolved"] as Status[]).map((value) => { const count = incidents.filter((incident) => incident.status === value).length; return <div key={value}><span>{statusLabel(value)}</span><b>{count}</b><em style={{ width: `${incidents.length ? count / incidents.length * 100 : 0}%` }} /></div>; })}</div></div>;
}
