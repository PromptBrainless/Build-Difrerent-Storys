import type { Choice, Dialog, DialogZeile, SaveData, Wert } from "@/lib/types";
import { bedingungErfuellt } from "@/spiel/engine/quest";
import type { Projekt } from "@/lib/types";

export function textMitWerten(text: string, spiel: SaveData): string {
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    const wert = spiel.variablen[key];
    return wert === undefined ? `{${key}}` : String(wert);
  });
}

export function setzeVariablen(spiel: SaveData, paar: { key: string; wert: Wert }[]): SaveData {
  if (paar.length === 0) return spiel;
  const variablen = { ...spiel.variablen };
  for (const eintrag of paar) variablen[eintrag.key] = eintrag.wert;
  return { ...spiel, variablen };
}

export function sichtbareChoices(zeile: DialogZeile, spiel: SaveData, projekt: Projekt): Choice[] {
  return zeile.choices.filter((choice) => !choice.bedingung || bedingungErfuellt(choice.bedingung, spiel, projekt));
}

export function alsSkript(dialog: Dialog): string {
  const zeilen = [`=== ${dialog.label} ===`];
  for (const zeile of dialog.zeilen) {
    zeilen.push(`${zeile.sprecher}: ${zeile.text}`);
    for (const choice of zeile.choices) {
      zeilen.push(`* [${choice.text}]${choice.naechsteId ? ` -> ${choice.naechsteId}` : ""}`);
    }
    zeilen.push("");
  }
  return zeilen.join("\n");
}
