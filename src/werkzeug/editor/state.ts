import { create } from "zustand";
import { persist } from "zustand/middleware";
import { paketKlon } from "@/inhalt/lindendorf";
import { neueId } from "@/lib/refs";
import { istProjekt, istSave, jsonSpeicher, leseSlots } from "@/lib/storage";
import type { Projekt, SaveData, SaveSlot, SpielModal } from "@/lib/types";
import { neuerStand } from "@/spiel/engine/quest";
import {
  abbrechen,
  klick,
  nachWurf,
  starte,
  szeneZurueck,
  waehle,
  weiter,
  wuerfle,
  type Laufzeit,
} from "@/spiel/runtime";

export type TabId = "assets" | "szenen" | "quests" | "npcs" | "ereignisse" | "proben" | "variablen" | "testen";

interface EditorState {
  projekt: Projekt;
  spiel: SaveData;
  slots: (SaveSlot | null)[];
  modal: SpielModal | null;
  schlange: string[];
  danach: string[];
  tab: TabId;
  setTab: (tab: TabId) => void;
  update: (fn: (projekt: Projekt) => Projekt) => void;
  beispiel: () => void;
  importieren: (projekt: Projekt) => void;
  neuesSpiel: () => void;
  speichernIn: (index: number) => void;
  laden: (index: number) => void;
  klick: (objektId: string) => void;
  wahl: (choiceId: string) => void;
  weiter: () => void;
  wuerfle: () => void;
  nachWurf: () => void;
  zurueckTaste: () => boolean;
}

const anfang = paketKlon();
const start = starte(anfang);

function laufAus(stand: Pick<EditorState, "spiel" | "modal" | "schlange" | "danach">): Laufzeit {
  return { spiel: stand.spiel, modal: stand.modal, schlange: stand.schlange, danach: stand.danach };
}

function ausLauf(lauf: Laufzeit): Pick<EditorState, "spiel" | "modal" | "schlange" | "danach"> {
  return { spiel: lauf.spiel, modal: lauf.modal, schlange: lauf.schlange, danach: lauf.danach };
}

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => ({
      projekt: anfang,
      spiel: start.spiel,
      slots: [null, null, null],
      modal: null,
      schlange: [],
      danach: [],
      tab: "szenen",
      setTab: (tab) => set({ tab }),
      update: (fn) => set((stand) => ({ projekt: fn(stand.projekt) })),
      beispiel: () => {
        const projekt = paketKlon();
        set({ projekt, ...ausLauf(starte(projekt)), slots: [null, null, null], tab: "szenen" });
      },
      importieren: (projekt) => set({ projekt, ...ausLauf(starte(projekt)), slots: [null, null, null] }),
      neuesSpiel: () => set(ausLauf(starte(get().projekt))),
      speichernIn: (index) => {
        const slots = [...get().slots];
        while (slots.length < 3) slots.push(null);
        const alt = slots[index];
        slots[index] = {
          id: alt?.id ?? neueId("save"),
          name: `Stand ${index + 1}`,
          aktualisiert: Date.now(),
          stand: structuredClone(get().spiel),
        };
        set({ slots: slots.slice(0, 3) });
      },
      laden: (index) => {
        const slot = get().slots[index];
        if (!slot) return;
        set({ spiel: structuredClone(slot.stand), modal: null, schlange: [], danach: [] });
      },
      klick: (objektId) => set(ausLauf(klick(get().projekt, laufAus(get()), objektId))),
      wahl: (choiceId) => set(ausLauf(waehle(get().projekt, laufAus(get()), choiceId))),
      weiter: () => set(ausLauf(weiter(get().projekt, laufAus(get())))),
      wuerfle: () => set(ausLauf(wuerfle(get().projekt, laufAus(get())))),
      nachWurf: () => set(ausLauf(nachWurf(get().projekt, laufAus(get())))),
      zurueckTaste: () => {
        const stand = get();
        if (stand.modal?.art === "wuerfel" && stand.modal.fertig) {
          set(ausLauf(nachWurf(stand.projekt, laufAus(stand))));
          return true;
        }
        if (stand.modal) {
          set(ausLauf(abbrechen(laufAus(stand))));
          return true;
        }
        const zurueck = szeneZurueck(stand.projekt, laufAus(stand));
        if (!zurueck) return false;
        set(ausLauf(zurueck));
        return true;
      },
    }),
    {
      name: "build-your-story-v1",
      storage: jsonSpeicher,
      skipHydration: true,
      partialize: (stand) => ({ projekt: stand.projekt, spiel: stand.spiel, slots: stand.slots }),
      merge: (persisted, current) => {
        const daten = persisted as { projekt?: unknown; spiel?: unknown; slots?: unknown } | undefined;
        if (!daten || !istProjekt(daten.projekt)) return current;
        const spiel = istSave(daten.spiel) ? daten.spiel : neuerStand(daten.projekt);
        return { ...current, projekt: daten.projekt, spiel, slots: leseSlots(daten.slots), modal: null, schlange: [], danach: [] };
      },
    },
  ),
);
