import type { SaveData, WuerfelProbe } from "@/lib/types";

export interface WurfErgebnis {
  wurf: number;
  summe: number;
  erfolg: boolean;
  stat: number;
}

export function auswerten(probe: WuerfelProbe, spiel: SaveData, wurf = 1 + Math.floor(Math.random() * 10)): WurfErgebnis {
  const stat = Number(spiel.variablen[probe.eigenschaft] ?? 0);
  const summe = wurf + (Number.isFinite(stat) ? stat : 0);
  return { wurf, summe, erfolg: summe >= probe.schwierigkeit, stat: Number.isFinite(stat) ? stat : 0 };
}
