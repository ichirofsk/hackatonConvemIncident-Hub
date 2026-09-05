import { LayoutDashboard, List, Plus, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontSizeControl } from "./FontSizeControl";

export function AppShell({ children, onNewIncident }: { children: ReactNode; onNewIncident: () => void }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" to="/"><span><ShieldAlert /></span><b>INCIDENT HUB<small>Operations Command Center</small></b></Link>
      <nav><NavLink to="/" end><LayoutDashboard />Dashboard</NavLink><NavLink to="/incidents"><List />Incidents</NavLink></nav>
    </aside>
    <main className="content">
      <header><div><h1>Operações em foco</h1><p>Acompanhe incidentes, priorize o que exige atenção e mantenha a equipe alinhada.</p></div><div className="actions"><FontSizeControl /><button className="primary" onClick={onNewIncident}><Plus />Novo incidente</button></div></header>
      {children}
    </main>
  </div>;
}
