import { createJSONStorage } from "zustand/middleware";
import type { Projekt, SaveData, SaveSlot } from "@/lib/types";

function lager(): Storage {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    };
  }
  return window.localStorage;
}

export const jsonSpeicher = createJSONStorage(lager);

export function istProjekt(wert: unknown): wert is Projekt {
  if (!wert || typeof wert !== "object") return false;
  const projekt = wert as Projekt;
  return (
    projekt.format === 1 &&
    typeof projekt.name === "string" &&
    typeof projekt.startSzeneId === "string" &&
    Array.isArray(projekt.szenen) &&
    Array.isArray(projekt.npcs) &&
    Array.isArray(projekt.dialoge) &&
    Array.isArray(projekt.quests) &&
    Array.isArray(projekt.ereignisse) &&
    Array.isArray(projekt.proben) &&
    Array.isArray(projekt.assets) &&
    Array.isArray(projekt.variablen) &&
    Array.isArray(projekt.gegenstaende) &&
    Array.isArray(projekt.kapitel)
  );
}

export function istSave(wert: unknown): wert is SaveData {
  if (!wert || typeof wert !== "object") return false;
  const stand = wert as SaveData;
  return (
    stand.format === 1 &&
    typeof stand.szeneId === "string" &&
    typeof stand.variablen === "object" &&
    stand.variablen !== null &&
    Array.isArray(stand.rueckweg) &&
    Array.isArray(stand.log) &&
    Array.isArray(stand.items)
  );
}

export function leseSlots(wert: unknown): (SaveSlot | null)[] {
  const leer: (SaveSlot | null)[] = [null, null, null];
  if (!Array.isArray(wert)) return leer;
  for (let index = 0; index < 3; index += 1) {
    const slot = wert[index];
    if (!slot || typeof slot !== "object") continue;
    const kandidat = slot as SaveSlot;
    if (typeof kandidat.id === "string" && typeof kandidat.name === "string" && istSave(kandidat.stand)) {
      leer[index] = kandidat;
    }
  }
  return leer;
}

export function projektExport(projekt: Projekt): void {
  const blob = new Blob([JSON.stringify(projekt, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projekt.name.toLowerCase().replace(/\s+/g, "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
