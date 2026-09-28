import type { Bedingung, Projekt, SaveData, Wert } from "@/lib/types";

export function bedingungErfuellt(bedingung: Bedingung | undefined, spiel: SaveData, _projekt: Projekt): boolean {
  if (!bedingung) return true;
  if (bedingung.art === "flag") {
    const hat = spiel.variablen[bedingung.key];
    if (bedingung.op === "eq") return hat === bedingung.wert;
    if (bedingung.op === "neq") return hat !== bedingung.wert;
    const links = Number(hat);
    const rechts = Number(bedingung.wert);
    if (bedingung.op === "gte") return links >= rechts;
    return links <= rechts;
  }
  if (bedingung.art === "item") {
    const hat = spiel.items.includes(bedingung.itemId);
    return bedingung.hat ? hat : !hat;
  }
  if (bedingung.art === "szene") return spiel.besuchteSzenen.includes(bedingung.szeneId);
  return spiel.gesprocheneNpcs.includes(bedingung.npcId);
}

export function bedingungText(bedingung: Bedingung | undefined, projekt: Projekt): string {
  if (!bedingung) return "immer";
  if (bedingung.art === "flag") return `${bedingung.key} ${bedingung.op} ${String(bedingung.wert)}`;
  if (bedingung.art === "item") {
    const name = projekt.gegenstaende.find((gegenstand) => gegenstand.id === bedingung.itemId)?.name ?? bedingung.itemId;
    return bedingung.hat ? `hat ${name}` : `ohne ${name}`;
  }
  if (bedingung.art === "szene") {
    return `war in ${projekt.szenen.find((szene) => szene.id === bedingung.szeneId)?.name ?? bedingung.szeneId}`;
  }
  return `sprach mit ${projekt.npcs.find((npc) => npc.id === bedingung.npcId)?.name ?? bedingung.npcId}`;
}

export function standardBedingung(art: Bedingung["art"], projekt: Projekt): Bedingung {
  if (art === "flag") {
    const variable = projekt.variablen.find((eintrag) => eintrag.typ === "bool") ?? projekt.variablen[0];
    const wert: Wert = variable?.typ === "number" ? 1 : variable?.typ === "string" ? "" : true;
    return { art: "flag", key: variable?.name ?? "flag", op: "eq", wert };
  }
  if (art === "item") return { art: "item", itemId: projekt.gegenstaende[0]?.id ?? "", hat: true };
  if (art === "szene") return { art: "szene", szeneId: projekt.szenen[0]?.id ?? "" };
  return { art: "npc", npcId: projekt.npcs[0]?.id ?? "" };
}

export function neuerStand(projekt: Projekt): SaveData {
  const variablen: Record<string, Wert> = {};
  for (const variable of projekt.variablen) variablen[variable.name] = variable.standard;
  const szeneId = projekt.startSzeneId;
  const ort = projekt.szenen.find((szene) => szene.id === szeneId)?.name ?? "der Geschichte";
  return {
    format: 1,
    szeneId,
    variablen,
    questStatus: {},
    taskErledigt: {},
    besuchteSzenen: szeneId ? [szeneId] : [],
    gesprocheneNpcs: [],
    items: [],
    xp: 0,
    log: [`Du stehst in ${ort}.`],
    rueckweg: szeneId ? [szeneId] : [],
  };
}

export function fortschritt(projekt: Projekt, spiel: SaveData): { spiel: SaveData; folgen: string[] } {
  const next: SaveData = {
    ...spiel,
    variablen: { ...spiel.variablen },
    questStatus: { ...spiel.questStatus },
    taskErledigt: { ...spiel.taskErledigt },
    items: [...spiel.items],
    besuchteSzenen: [...spiel.besuchteSzenen],
    gesprocheneNpcs: [...spiel.gesprocheneNpcs],
    log: [...spiel.log],
    rueckweg: [...spiel.rueckweg],
  };
  const folgen: string[] = [];
  for (let pass = 0; pass < 4; pass += 1) {
    let geaendert = false;
    for (const quest of projekt.quests) {
      let status = next.questStatus[quest.id] ?? "nicht_gestartet";
      const startOk =
        quest.startBedingungen.length === 0 ||
        quest.startBedingungen.every((bedingung) => bedingungErfuellt(bedingung, next, projekt));
      if (status === "nicht_gestartet" && startOk) {
        status = "aktiv";
        next.questStatus[quest.id] = "aktiv";
        next.log.push(`Quest begonnen: ${quest.name}`);
        geaendert = true;
      }
      if (status !== "aktiv") continue;
      for (const task of quest.tasks) {
        const key = `${quest.id}:${task.id}`;
        if (next.taskErledigt[key]) continue;
        if (!bedingungErfuellt(task.bedingung, next, projekt)) continue;
        next.taskErledigt[key] = true;
        next.log.push(task.beschreibung);
        if (task.ereignisId) folgen.push(task.ereignisId);
        geaendert = true;
      }
      const fertig = quest.tasks.length > 0 && quest.tasks.every((task) => next.taskErledigt[`${quest.id}:${task.id}`]);
      if (!fertig) continue;
      next.questStatus[quest.id] = "abgeschlossen";
      next.xp += quest.belohnung.xp;
      for (const item of quest.belohnung.items) {
        if (!next.items.includes(item)) next.items.push(item);
      }
      for (const flag of quest.belohnung.flags) next.variablen[flag.key] = flag.wert;
      next.log.push(`Abgeschlossen: ${quest.name} (+${quest.belohnung.xp} XP)`);
      geaendert = true;
    }
    if (!geaendert) break;
  }
  next.log = next.log.slice(-40);
  return { spiel: next, folgen };
}
