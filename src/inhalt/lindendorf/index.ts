import type { Projekt } from "@/lib/types";
import { istProjekt } from "@/lib/storage";
import assets from "./assets.json";
import szenenDatei from "./szenen.json";
import npcsDatei from "./npcs.json";
import questsDatei from "./quests.json";
import ereignisse from "./ereignisse.json";
import proben from "./proben.json";
import variablen from "./variablen.json";

const roh = {
  format: 1 as const,
  id: "lindendorf",
  name: "Lindendorf",
  startSzeneId: szenenDatei.startSzeneId,
  kapitel: questsDatei.kapitel,
  assets,
  variablen,
  gegenstaende: questsDatei.gegenstaende,
  szenen: szenenDatei.szenen,
  npcs: npcsDatei.npcs,
  dialoge: npcsDatei.dialoge,
  quests: questsDatei.quests,
  ereignisse,
  proben,
};

if (!istProjekt(roh)) {
  throw new Error("Lindendorf-Paket ist ungültig.");
}

export const lindendorf: Projekt = roh;

export function paketKlon(): Projekt {
  return structuredClone(lindendorf);
}
