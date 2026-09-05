import { AlertTriangle } from "lucide-react";

export function EmptyState({ text }: { text: string }) {
  return <div className="empty"><AlertTriangle /><p>{text}</p></div>;
}

export function LoadingState() {
  return <div className="loading">Carregando visão operacional...</div>;
}
