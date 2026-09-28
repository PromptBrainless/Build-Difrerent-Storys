import type { Npc, Projekt } from "@/lib/types";

export function npcNachId(projekt: Projekt, id: string): Npc | undefined {
  return projekt.npcs.find((npc) => npc.id === id);
}

export function portraitPfad(projekt: Projekt, npc: Npc): string | undefined {
  return projekt.assets.find((asset) => asset.id === npc.portraitAssetId)?.pfad;
}
