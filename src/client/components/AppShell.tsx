import { LayoutDashboard, List, Plus, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

export function AppShell({ children, onNewIncident }: { children: ReactNode; onNewIncident: () => void }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" to="/"><span><ShieldAlert /></span><b>INCIDENT HUB<small>Operations Command Center</small></b></Link>
      <nav><NavLink to="/" end><LayoutDashboard />Dashboard</NavLink><NavLink to="/incidents"><List />Incidents</NavLink></nav>
      <div className="system"><small>SYSTEM STATUS</small><p><i />Incident monitoring active</p><strong>OT</strong><b>Operations Team<small>Equipe de Operações</small></b></div>
    </aside>
    <main className="content">
      <header><div><h1>Bom dia, Equipe! 👋</h1><p>Aqui está o resumo dos incidentes atuais.</p></div><div className="actions"><button className="primary" onClick={onNewIncident}><Plus />Novo incidente</button></div></header>
      {children}
    </main>
  </div>;
}
