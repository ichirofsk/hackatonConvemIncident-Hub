import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { NewIncidentModal } from "./components/NewIncidentModal";
import { Dashboard } from "./pages/Dashboard";
import { IncidentDetail } from "./pages/IncidentDetail";
import { Incidents } from "./pages/Incidents";

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewIncidentModalOpen = location.pathname === "/incidents/new";

  return <AppShell onNewIncident={() => navigate("/incidents/new")}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/incidents" element={<Incidents />} />
      <Route path="/incidents/new" element={<Incidents />} />
      <Route path="/incidents/:id" element={<IncidentDetail />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
    {isNewIncidentModalOpen && <NewIncidentModal close={() => navigate("/incidents")} onCreated={(incident) => navigate(`/incidents/${incident.id}`)} />}
  </AppShell>;
}
