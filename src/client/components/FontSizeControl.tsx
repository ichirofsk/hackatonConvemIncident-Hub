import { useEffect, useState } from "react";

const storageKey = "incident-hub.font-scale";
const scales = [0.9, 1, 1.15, 1.3] as const;
const labels: Record<(typeof scales)[number], string> = {
  0.9: "pequeno",
  1: "padrão",
  1.15: "grande",
  1.3: "muito grande",
};

function initialScale() {
  const stored = Number(localStorage.getItem(storageKey));
  return scales.includes(stored as (typeof scales)[number]) ? stored as (typeof scales)[number] : 1;
}

export function FontSizeControl() {
  const [scale, setScale] = useState(initialScale);
  const index = scales.indexOf(scale);

  useEffect(() => {
    document.documentElement.dataset.fontScale = String(scale);
    localStorage.setItem(storageKey, String(scale));
  }, [scale]);

  return <div className="font-size-control" role="group" aria-label="Tamanho do texto">
    <button type="button" aria-label="Reduzir tamanho do texto" disabled={index === 0} onClick={() => setScale(scales[index - 1])}>A−</button>
    <output aria-live="polite">Texto {labels[scale]}</output>
    <button type="button" aria-label="Aumentar tamanho do texto" disabled={index === scales.length - 1} onClick={() => setScale(scales[index + 1])}>A+</button>
  </div>;
}
