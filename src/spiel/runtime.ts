import type { Ereignis, Id, Projekt, SaveData, SpielModal } from "@/lib/types";
import { setzeVariablen } from "@/spiel/engine/dialog";
import { auswerten } from "@/spiel/engine/probe";
import { fortschritt, neuerStand } from "@/spiel/engine/quest";

export interface Laufzeit {
  spiel: SaveData;
  modal: SpielModal | null;
  schlange: Id[];
  danach: Id[];
}

function logge(spiel: SaveData, zeile: string): SaveData {
  return { ...spiel, log: [...spiel.log, zeile].slice(-40) };
}

function wende(projekt: Projekt, lauf: Laufzeit, ereignis: Ereignis): Laufzeit {
  if (ereignis.typ === "dialog") {
    const dialog = projekt.dialoge.find((eintrag) => eintrag.id === ereignis.dialogId);
    const zeile = dialog?.zeilen[0];
    let spiel = lauf.spiel;
    if (ereignis.npcId && !spiel.gesprocheneNpcs.includes(ereignis.npcId)) {
      spiel = { ...spiel, gesprocheneNpcs: [...spiel.gesprocheneNpcs, ereignis.npcId] };
    }
    if (zeile) spiel = setzeVariablen(spiel, zeile.variablen);
    const fort = fortschritt(projekt, spiel);
    if (!dialog || !zeile) {
      return {
        ...lauf,
        spiel: fort.spiel,
        schlange: [...lauf.schlange, ...ereignis.folgeIds, ...fort.folgen],
      };
    }
    return {
      spiel: fort.spiel,
      modal: { art: "dialog", dialogId: dialog.id, zeileId: zeile.id },
      schlange: lauf.schlange,
      danach: [...lauf.danach, ...ereignis.folgeIds, ...fort.folgen],
    };
  }

  if (ereignis.typ === "wuerfel") {
    return { ...lauf, modal: { art: "wuerfel", probeId: ereignis.probeId ?? "", fertig: false } };
  }

  if (ereignis.typ === "szene_wechsel" && ereignis.zielSzeneId) {
    const ziel = projekt.szenen.find((szene) => szene.id === ereignis.zielSzeneId);
    if (!ziel) return lauf;
    const alt = projekt.szenen.find((szene) => szene.id === lauf.spiel.szeneId);
    const besucht = lauf.spiel.besuchteSzenen.includes(ziel.id)
      ? lauf.spiel.besuchteSzenen
      : [...lauf.spiel.besuchteSzenen, ziel.id];
    const letzte = lauf.spiel.rueckweg[lauf.spiel.rueckweg.length - 1];
    const rueckweg = letzte === ziel.id ? lauf.spiel.rueckweg : [...lauf.spiel.rueckweg, ziel.id].slice(-24);
    const fort = fortschritt(projekt, { ...lauf.spiel, szeneId: ziel.id, besuchteSzenen: besucht, rueckweg });
    return {
      ...lauf,
      spiel: fort.spiel,
      schlange: [...(alt?.beimVerlassen ?? []), ...ziel.beimBetreten, ...ereignis.folgeIds, ...fort.folgen, ...lauf.schlange],
    };
  }

  if (ereignis.typ === "flag_set" && ereignis.flagKey) {
    const spiel = setzeVariablen(lauf.spiel, [{ key: ereignis.flagKey, wert: ereignis.flagWert ?? true }]);
    const fort = fortschritt(projekt, spiel);
    return { ...lauf, spiel: fort.spiel, schlange: [...ereignis.folgeIds, ...fort.folgen, ...lauf.schlange] };
  }

  const spiel = ereignis.notiz ? logge(lauf.spiel, ereignis.notiz) : lauf.spiel;
  const fort = fortschritt(projekt, spiel);
  return { ...lauf, spiel: fort.spiel, schlange: [...ereignis.folgeIds, ...fort.folgen, ...lauf.schlange] };
}

export function pumpe(projekt: Projekt, lauf: Laufzeit): Laufzeit {
  let aktuell = lauf;
  for (let schritt = 0; schritt < 48; schritt += 1) {
    if (aktuell.modal || aktuell.schlange.length === 0) return aktuell;
    const id = aktuell.schlange[0];
    if (!id) return aktuell;
    const ereignis = projekt.ereignisse.find((eintrag) => eintrag.id === id);
    aktuell = { ...aktuell, schlange: aktuell.schlange.slice(1) };
    if (!ereignis) continue;
    aktuell = wende(projekt, aktuell, ereignis);
  }
  return aktuell;
}

export function starte(projekt: Projekt): Laufzeit {
  const fort = fortschritt(projekt, neuerStand(projekt));
  const szene = projekt.szenen.find((eintrag) => eintrag.id === fort.spiel.szeneId);
  return pumpe(projekt, {
    spiel: fort.spiel,
    modal: null,
    danach: [],
    schlange: [...(szene?.beimBetreten ?? []), ...fort.folgen],
  });
}

export function klick(projekt: Projekt, lauf: Laufzeit, objektId: Id): Laufzeit {
  if (lauf.modal) return lauf;
  const szene = projekt.szenen.find((eintrag) => eintrag.id === lauf.spiel.szeneId);
  const objekt = szene?.objekte.find((eintrag) => eintrag.id === objektId);
  if (!objekt) return lauf;
  return pumpe(projekt, { ...lauf, schlange: [...lauf.schlange, ...objekt.ereignisIds] });
}

export function waehle(projekt: Projekt, lauf: Laufzeit, choiceId: Id): Laufzeit {
  const modal = lauf.modal;
  if (!modal || modal.art !== "dialog") return lauf;
  const dialog = projekt.dialoge.find((eintrag) => eintrag.id === modal.dialogId);
  const zeile = dialog?.zeilen.find((eintrag) => eintrag.id === modal.zeileId);
  const choice = zeile?.choices.find((eintrag) => eintrag.id === choiceId);
  if (!dialog || !zeile || !choice) return lauf;
  let spiel = setzeVariablen(lauf.spiel, choice.variablen);
  const naechste = choice.naechsteId ? dialog.zeilen.find((eintrag) => eintrag.id === choice.naechsteId) : undefined;
  if (naechste) {
    spiel = setzeVariablen(spiel, naechste.variablen);
    const fort = fortschritt(projekt, spiel);
    return {
      spiel: fort.spiel,
      modal: { art: "dialog", dialogId: dialog.id, zeileId: naechste.id },
      schlange: lauf.schlange,
      danach: [...lauf.danach, ...choice.ereignisIds, ...fort.folgen],
    };
  }
  const fort = fortschritt(projekt, spiel);
  return pumpe(projekt, {
    spiel: fort.spiel,
    modal: null,
    danach: [],
    schlange: [...choice.ereignisIds, ...lauf.danach, ...fort.folgen, ...lauf.schlange],
  });
}

export function weiter(projekt: Projekt, lauf: Laufzeit): Laufzeit {
  const modal = lauf.modal;
  if (!modal || modal.art !== "dialog") return lauf;
  const dialog = projekt.dialoge.find((eintrag) => eintrag.id === modal.dialogId);
  if (!dialog) return lauf;
  const index = dialog.zeilen.findIndex((zeile) => zeile.id === modal.zeileId);
  const naechste = dialog.zeilen[index + 1];
  if (naechste) {
    const fort = fortschritt(projekt, setzeVariablen(lauf.spiel, naechste.variablen));
    return {
      spiel: fort.spiel,
      modal: { art: "dialog", dialogId: dialog.id, zeileId: naechste.id },
      schlange: lauf.schlange,
      danach: [...lauf.danach, ...fort.folgen],
    };
  }
  return pumpe(projekt, { spiel: lauf.spiel, modal: null, danach: [], schlange: [...lauf.danach, ...lauf.schlange] });
}

export function wuerfle(projekt: Projekt, lauf: Laufzeit): Laufzeit {
  const modal = lauf.modal;
  if (!modal || modal.art !== "wuerfel" || modal.fertig) return lauf;
  const probe = projekt.proben.find((eintrag) => eintrag.id === modal.probeId);
  if (!probe) return { ...lauf, modal: { ...modal, wurf: 0, summe: 0, erfolg: false, fertig: true } };
  const ergebnis = auswerten(probe, lauf.spiel);
  return {
    ...lauf,
    modal: { art: "wuerfel", probeId: modal.probeId, wurf: ergebnis.wurf, summe: ergebnis.summe, erfolg: ergebnis.erfolg, fertig: true },
  };
}

export function nachWurf(projekt: Projekt, lauf: Laufzeit): Laufzeit {
  const modal = lauf.modal;
  if (!modal || modal.art !== "wuerfel" || !modal.fertig) return lauf;
  const probe = projekt.proben.find((eintrag) => eintrag.id === modal.probeId);
  const ids = modal.erfolg ? (probe?.erfolgEreignisIds ?? []) : (probe?.misserfolgEreignisIds ?? []);
  const zeile = probe
    ? `${probe.name}: ${modal.wurf} + ${probe.eigenschaft} = ${modal.summe} (${modal.erfolg ? "gelungen" : "misslungen"})`
    : "Die Probe fehlt.";
  return pumpe(projekt, {
    spiel: logge(lauf.spiel, zeile),
    modal: null,
    danach: [],
    schlange: [...ids, ...lauf.schlange],
  });
}

export function abbrechen(lauf: Laufzeit): Laufzeit {
  if (!lauf.modal) return lauf;
  return { ...lauf, modal: null, danach: [] };
}

export function szeneZurueck(projekt: Projekt, lauf: Laufzeit): Laufzeit | null {
  const weg = lauf.spiel.rueckweg;
  if (weg.length < 2) return null;
  const zielId = weg[weg.length - 2];
  if (!zielId) return null;
  const ziel = projekt.szenen.find((szene) => szene.id === zielId);
  if (!ziel) return null;
  const fort = fortschritt(projekt, { ...lauf.spiel, szeneId: ziel.id, rueckweg: weg.slice(0, -1) });
  return pumpe(projekt, {
    spiel: fort.spiel,
    modal: null,
    danach: [],
    schlange: [...ziel.beimBetreten, ...fort.folgen],
  });
}
