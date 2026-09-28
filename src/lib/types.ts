export type Id = string;
export type Wert = boolean | number | string;
export type AssetTyp = "hintergrund" | "portrait" | "wissen" | "sonstiges";
export type AssetQuelle = "paket" | "lokal" | "url";
export type Verhalten = "stationaer" | "patrol" | "custom";
export type EreignisTyp = "dialog" | "wuerfel" | "szene_wechsel" | "flag_set" | "custom";
export type QuestStatus = "nicht_gestartet" | "aktiv" | "abgeschlossen" | "gescheitert";
export type Vergleich = "eq" | "neq" | "gte" | "lte";

export interface Asset {
  id: Id;
  name: string;
  typ: AssetTyp;
  quelle: AssetQuelle;
  pfad: string;
  tags: string[];
}

export interface Variable {
  id: Id;
  name: string;
  typ: "bool" | "number" | "string";
  standard: Wert;
  beschreibung: string;
}

export type Bedingung =
  | { art: "flag"; key: string; op: Vergleich; wert: Wert }
  | { art: "item"; itemId: Id; hat: boolean }
  | { art: "szene"; szeneId: Id }
  | { art: "npc"; npcId: Id };

export interface Kapitel {
  id: Id;
  name: string;
}

export interface Gegenstand {
  id: Id;
  name: string;
  assetId?: Id;
  beschreibung: string;
}

export interface QuestTask {
  id: Id;
  beschreibung: string;
  bedingung: Bedingung;
  ereignisId?: Id;
}

export interface Belohnung {
  items: Id[];
  flags: { key: string; wert: Wert }[];
  xp: number;
}

export interface Quest {
  id: Id;
  kapitelId: Id;
  name: string;
  beschreibung: string;
  startBedingungen: Bedingung[];
  tasks: QuestTask[];
  belohnung: Belohnung;
  startSzeneId?: Id;
  zielSzeneIds: Id[];
  startNpcId?: Id;
  abgabeNpcId?: Id;
}

export interface SzenenObjekt {
  id: Id;
  typ: "npc" | "trigger" | "item";
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  referenzId?: Id;
  ereignisIds: Id[];
}

export interface Szene {
  id: Id;
  name: string;
  hintergrundAssetId?: Id;
  beimBetreten: Id[];
  beimVerlassen: Id[];
  objekte: SzenenObjekt[];
}

export interface Choice {
  id: Id;
  text: string;
  naechsteId?: Id;
  ereignisIds: Id[];
  bedingung?: Bedingung;
  variablen: { key: string; wert: Wert }[];
}

export interface DialogZeile {
  id: Id;
  sprecher: string;
  text: string;
  choices: Choice[];
  variablen: { key: string; wert: Wert }[];
}

export interface Dialog {
  id: Id;
  label: string;
  zeilen: DialogZeile[];
}

export interface Npc {
  id: Id;
  name: string;
  portraitAssetId?: Id;
  verhalten: Verhalten;
  dialogId?: Id;
}

export interface Ereignis {
  id: Id;
  name: string;
  typ: EreignisTyp;
  npcId?: Id;
  dialogId?: Id;
  probeId?: Id;
  zielSzeneId?: Id;
  flagKey?: string;
  flagWert?: Wert;
  notiz?: string;
  folgeIds: Id[];
}

export interface WuerfelProbe {
  id: Id;
  name: string;
  eigenschaft: string;
  schwierigkeit: number;
  erfolgEreignisIds: Id[];
  misserfolgEreignisIds: Id[];
}

export interface Projekt {
  format: 1;
  id: Id;
  name: string;
  startSzeneId: Id;
  kapitel: Kapitel[];
  assets: Asset[];
  variablen: Variable[];
  gegenstaende: Gegenstand[];
  szenen: Szene[];
  npcs: Npc[];
  dialoge: Dialog[];
  quests: Quest[];
  ereignisse: Ereignis[];
  proben: WuerfelProbe[];
}

export interface SaveData {
  format: 1;
  szeneId: Id;
  variablen: Record<string, Wert>;
  questStatus: Record<Id, QuestStatus>;
  taskErledigt: Record<string, boolean>;
  besuchteSzenen: Id[];
  gesprocheneNpcs: Id[];
  items: Id[];
  xp: number;
  log: string[];
  rueckweg: Id[];
}

export interface SaveSlot {
  id: Id;
  name: string;
  aktualisiert: number;
  stand: SaveData;
}

export type SpielModal =
  | { art: "dialog"; dialogId: Id; zeileId: Id }
  | {
      art: "wuerfel";
      probeId: Id;
      wurf?: number;
      summe?: number;
      erfolg?: boolean;
      fertig: boolean;
    };
