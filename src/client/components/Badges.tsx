import type { Severity, Status } from "../api";
import { severityClass, statusLabel } from "../utils/presentation";

export function SeverityBadge({ value }: { value: Severity }) {
  return <span className={`badge ${severityClass(value)}`}>{value}</span>;
}

export function StatusBadge({ value }: { value: Status }) {
  return <span className={`badge status-${value.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(value)}</span>;
}
