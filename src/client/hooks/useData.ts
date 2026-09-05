import { useEffect, useState } from "react";

export function useData<T>(load: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    load()
      .then((value) => active && setData(value))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "Erro ao carregar dados."));
    return () => { active = false; };
  }, dependencies);

  return {
    data,
    error,
    refresh: () => load().then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : "Erro ao carregar dados.")),
  };
}
