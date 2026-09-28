import type { Projekt, Szene } from "@/lib/types";

export function szeneNachId(projekt: Projekt, id: string): Szene | undefined {
  return projekt.szenen.find((szene) => szene.id === id);
}

export function hintergrundPfad(projekt: Projekt, szene: Szene): string | undefined {
  return projekt.assets.find((asset) => asset.id === szene.hintergrundAssetId)?.pfad;
}

export function klemme(wert: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, wert));
}
