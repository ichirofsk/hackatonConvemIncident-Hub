import type { Severity, Status } from "../api";

export const severityClass = (value: Severity) => `severity-${value.toLowerCase()}`;
export const statusLabel = (value: Status) => (value === "Open" ? "Open (New)" : value);
export const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
