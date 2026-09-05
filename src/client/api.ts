export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Status = "Open" | "In Progress" | "Resolved";
export type Incident = { id: string; title: string; description: string; severity: Severity; owner: string; status: Status; createdAt: string; updatedAt: string };
export type Activity = { type: "status-change"; id: string; occurredAt: string; previousStatus: Status; nextStatus: Status } | { type: "comment"; id: string; occurredAt: string; author: string; content: string };
export type Details = { incident: Incident; history: unknown[] };
export type Metrics = { openIncidents: number; unresolvedCriticalIncidents: number; resolvedIncidents: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, ...init });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Não foi possível concluir a operação.");
  return body as T;
}

export const api = {
  list: (filters: { status?: string; severity?: string } = {}) => request<{ items: Incident[] }>(`/incidents?${new URLSearchParams(filters).toString()}`),
  metrics: () => request<Metrics>("/dashboard"), details: (id: string) => request<Details>(`/incidents/${id}`), activity: (id: string) => request<{ items: Activity[] }>(`/incidents/${id}/activity`),
  create: (input: Pick<Incident, "title" | "description" | "severity" | "owner">) => request<Incident>("/incidents", { method: "POST", body: JSON.stringify(input) }),
  updateStatus: (id: string, status: Status) => request<Incident>(`/incidents/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  comment: (id: string, author: string, content: string) => request(`/incidents/${id}/comments`, { method: "POST", body: JSON.stringify({ author, content }) }),
};
