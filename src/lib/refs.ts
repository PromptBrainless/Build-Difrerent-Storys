import type { Bedingung, Projekt } from "@/lib/types";

export function neueId(prefix: string): string {
  const zufall = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${zufall.slice(0, 8)}`;
}

export function ersetze<T extends { id: string }>(liste: T[], id: string, fn: (eintrag: T) => T): T[] {
  return liste.map((eintrag) => (eintrag.id === id ? fn(eintrag) : eintrag));
}

function ohne(ids: string[], id: string): string[] {
  return ids.filter((eintrag) => eintrag !== id);
}

function bedingungBleibt(bedingung: Bedingung, art: Bedingung["art"], id: string): boolean {
  if (art === "szene" && bedingung.art === "szene") return bedingung.szeneId !== id;
  if (art === "npc" && bedingung.art === "npc") return bedingung.npcId !== id;
  if (art === "item" && bedingung.art === "item") return bedingung.itemId !== id;
  return true;
}

function questsOhne(projekt: Projekt, art: Bedingung["art"], id: string): Projekt["quests"] {
  return projekt.quests.map((quest) => ({
    ...quest,
    startSzeneId: art === "szene" && quest.startSzeneId === id ? undefined : quest.startSzeneId,
    startNpcId: art === "npc" && quest.startNpcId === id ? undefined : quest.startNpcId,
    abgabeNpcId: art === "npc" && quest.abgabeNpcId === id ? undefined : quest.abgabeNpcId,
    zielSzeneIds: art === "szene" ? ohne(quest.zielSzeneIds, id) : quest.zielSzeneIds,
    belohnung: {
      ...quest.belohnung,
      items: art === "item" ? ohne(quest.belohnung.items, id) : quest.belohnung.items,
    },
    startBedingungen: quest.startBedingungen.filter((bedingung) => bedingungBleibt(bedingung, art, id)),
    tasks: quest.tasks.filter((task) => bedingungBleibt(task.bedingung, art, id)),
  }));
}

export function ohneEreignis(projekt: Projekt, id: string): Projekt {
  return {
    ...projekt,
    ereignisse: projekt.ereignisse
      .filter((ereignis) => ereignis.id !== id)
      .map((ereignis) => ({ ...ereignis, folgeIds: ohne(ereignis.folgeIds, id) })),
    proben: projekt.proben.map((probe) => ({
      ...probe,
      erfolgEreignisIds: ohne(probe.erfolgEreignisIds, id),
      misserfolgEreignisIds: ohne(probe.misserfolgEreignisIds, id),
    })),
    szenen: projekt.szenen.map((szene) => ({
      ...szene,
      beimBetreten: ohne(szene.beimBetreten, id),
      beimVerlassen: ohne(szene.beimVerlassen, id),
      objekte: szene.objekte.map((objekt) => ({ ...objekt, ereignisIds: ohne(objekt.ereignisIds, id) })),
    })),
    quests: projekt.quests.map((quest) => ({
      ...quest,
      tasks: quest.tasks.map((task) => (task.ereignisId === id ? { ...task, ereignisId: undefined } : task)),
    })),
    dialoge: projekt.dialoge.map((dialog) => ({
      ...dialog,
      zeilen: dialog.zeilen.map((zeile) => ({
        ...zeile,
        choices: zeile.choices.map((choice) => ({ ...choice, ereignisIds: ohne(choice.ereignisIds, id) })),
      })),
    })),
  };
}

export function ohneSzene(projekt: Projekt, id: string): Projekt {
  const szenen = projekt.szenen.filter((szene) => szene.id !== id);
  return {
    ...projekt,
    szenen,
    startSzeneId: projekt.startSzeneId === id ? (szenen[0]?.id ?? "") : projekt.startSzeneId,
    ereignisse: projekt.ereignisse.map((ereignis) =>
      ereignis.zielSzeneId === id ? { ...ereignis, zielSzeneId: undefined } : ereignis,
    ),
    quests: questsOhne(projekt, "szene", id).map((quest) => ({
      ...quest,
      startSzeneId: quest.startSzeneId,
    })),
  };
}

export function ohneNpc(projekt: Projekt, id: string): Projekt {
  const npc = projekt.npcs.find((eintrag) => eintrag.id === id);
  const dialogId = npc?.dialogId;
  return {
    ...projekt,
    npcs: projekt.npcs.filter((eintrag) => eintrag.id !== id),
    dialoge: dialogId ? projekt.dialoge.filter((dialog) => dialog.id !== dialogId) : projekt.dialoge,
    szenen: projekt.szenen.map((szene) => ({
      ...szene,
      objekte: szene.objekte.map((objekt) =>
        objekt.typ === "npc" && objekt.referenzId === id ? { ...objekt, referenzId: undefined } : objekt,
      ),
    })),
    ereignisse: projekt.ereignisse.map((ereignis) => ({
      ...ereignis,
      npcId: ereignis.npcId === id ? undefined : ereignis.npcId,
      dialogId: ereignis.dialogId === dialogId ? undefined : ereignis.dialogId,
    })),
    quests: questsOhne(projekt, "npc", id),
  };
}

export function ohneAsset(projekt: Projekt, id: string): Projekt {
  return {
    ...projekt,
    assets: projekt.assets.filter((asset) => asset.id !== id),
    npcs: projekt.npcs.map((npc) => (npc.portraitAssetId === id ? { ...npc, portraitAssetId: undefined } : npc)),
    gegenstaende: projekt.gegenstaende.map((gegenstand) =>
      gegenstand.assetId === id ? { ...gegenstand, assetId: undefined } : gegenstand,
    ),
    szenen: projekt.szenen.map((szene) =>
      szene.hintergrundAssetId === id ? { ...szene, hintergrundAssetId: undefined } : szene,
    ),
  };
}

export function ohneProbe(projekt: Projekt, id: string): Projekt {
  return {
    ...projekt,
    proben: projekt.proben.filter((probe) => probe.id !== id),
    ereignisse: projekt.ereignisse.map((ereignis) =>
      ereignis.probeId === id ? { ...ereignis, probeId: undefined } : ereignis,
    ),
  };
}

export function ohneGegenstand(projekt: Projekt, id: string): Projekt {
  return {
    ...questsGegenstaende(projekt, id),
    szenen: projekt.szenen.map((szene) => ({
      ...szene,
      objekte: szene.objekte.map((objekt) =>
        objekt.typ === "item" && objekt.referenzId === id ? { ...objekt, referenzId: undefined } : objekt,
      ),
    })),
  };
}

function questsGegenstaende(projekt: Projekt, id: string): Projekt {
  return {
    ...projekt,
    gegenstaende: projekt.gegenstaende.filter((gegenstand) => gegenstand.id !== id),
    quests: questsOhne(projekt, "item", id),
  };
}

export function ohneVariable(projekt: Projekt, id: string): Projekt {
  return { ...projekt, variablen: projekt.variablen.filter((variable) => variable.id !== id) };
}
