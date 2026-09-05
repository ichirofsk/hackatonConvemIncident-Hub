import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Activity } from "../api";
import { SeverityBadge, StatusBadge } from "../components/Badges";
import { EmptyState, LoadingState } from "../components/States";
import { useData } from "../hooks/useData";
import { formatDate, statusLabel } from "../utils/presentation";

export function IncidentDetail() {
  const { id = "" } = useParams();
  const details = useData(() => api.details(id), [id]);
  const activity = useData(() => api.activity(id), [id]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  if (details.error) return <EmptyState text={details.error} />;
  if (!details.data) return <LoadingState />;

  const incident = details.data.incident;
  const nextStatus = incident.status === "Open" ? "In Progress" : incident.status === "In Progress" ? "Resolved" : undefined;
  async function changeStatus() {
    if (!nextStatus) return;
    try { await api.updateStatus(id, nextStatus); setNotice("Status atualizado com sucesso."); details.refresh(); activity.refresh(); } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Erro ao atualizar status."); }
  }
  async function addComment(event: FormEvent) {
    event.preventDefault();
    try { await api.comment(id, author, content); setContent(""); setNotice("Comentário adicionado com sucesso."); activity.refresh(); } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Erro ao adicionar comentário."); }
  }

  return <section className="detail">
    <Link className="back" to="/incidents"><ArrowLeft />Voltar para incidentes</Link>{notice && <div className="toast">{notice}</div>}
    <div className="detail-head"><div><SeverityBadge value={incident.severity} /><h2>{incident.title}</h2><p>ID: {incident.id}</p></div><div><small>STATUS ATUAL</small><StatusBadge value={incident.status} />{nextStatus && <button className="primary" onClick={changeStatus}>{nextStatus === "Resolved" ? "Marcar como Resolved" : "Mover para In Progress"}</button>}</div></div>
    <div className="detail-grid"><article className="panel"><h3>Descrição</h3><p>{incident.description}</p><div className="metadata"><div><small>RESPONSÁVEL</small><b>{incident.owner}</b></div><div><small>CRIADO EM</small><b>{formatDate(incident.createdAt)}</b></div><div><small>ÚLTIMA ATUALIZAÇÃO</small><b>{formatDate(incident.updatedAt)}</b></div></div></article><article className="panel"><h3>Atividade</h3><div className="timeline">{activity.data?.items.length ? activity.data.items.map((item: Activity) => <div className="event" key={item.id}><i /><time>{formatDate(item.occurredAt)}</time><p>{item.type === "comment" ? <><b>{item.author} comentou</b><br />{item.content}</> : <>Status alterado: <b>{statusLabel(item.previousStatus)} → {statusLabel(item.nextStatus)}</b></>}</p></div>) : <EmptyState text="Ainda não há atividade registrada." />}</div></article></div>
    <form className="panel comment" onSubmit={addComment}><h3><MessageSquare />Adicionar comentário</h3><input required placeholder="Seu nome" value={author} onChange={(event) => setAuthor(event.target.value)} /><textarea required placeholder="Escreva uma atualização para a equipe..." value={content} onChange={(event) => setContent(event.target.value)} /><button className="primary"><Send />Adicionar comentário</button></form>
  </section>;
}
