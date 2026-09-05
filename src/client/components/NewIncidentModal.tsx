import type { FormEvent } from "react";
import { useState } from "react";
import { api, type Incident, type Severity } from "../api";

export function NewIncidentModal({ close, onCreated }: { close: () => void; onCreated: (incident: Incident) => void }) {
  const [form, setForm] = useState({ title: "", description: "", severity: "Medium" as Severity, owner: "" });
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    try { onCreated(await api.create(form)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Erro ao criar incidente."); }
  }
  return <div className="modal-cover"><form className="modal" onSubmit={submit}>
    <h2>Novo incidente</h2><p>Registre um incidente para a equipe acompanhar.</p>{error && <div className="form-error">{error}</div>}
    <label>Título *<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
    <label>Descrição *<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
    <div className="form-grid"><label>Severidade *<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as Severity })}>{["Low", "Medium", "High", "Critical"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Responsável *<input required value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></label></div>
    <footer><button type="button" onClick={close}>Cancelar</button><button className="primary">Criar incidente</button></footer>
  </form></div>;
}
