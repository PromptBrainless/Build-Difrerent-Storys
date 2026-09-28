import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Bedingung, Projekt, Vergleich, Wert } from "@/lib/types";
import { bedingungText, standardBedingung } from "@/spiel/engine/quest";

export function Siegel({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" className="fill-wax" />
      <circle cx="20" cy="20" r="13" fill="none" className="stroke-ink" strokeWidth="1.4" />
      <path d="M15 26V15h6.2a4.2 4.2 0 0 1 0 8.4H15" fill="none" className="stroke-ink" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Btn({
  tone = "ghost",
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "wax" | "ghost" | "paper" }) {
  const ton =
    tone === "wax"
      ? "bg-wax text-ink hover:brightness-110"
      : tone === "paper"
        ? "bg-paper text-ink hover:brightness-105"
        : "border border-line bg-transparent text-fg hover:bg-raised";
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-wax disabled:opacity-50 ${ton} ${className}`}
      {...rest}
    />
  );
}

export function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm text-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Zweispalter({ liste, kinder }: { liste: ReactNode; kinder: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">{liste}</div>
      <div className="min-w-0">{kinder}</div>
    </div>
  );
}

export function IdHaken({
  label,
  eintraege,
  gewaehlt,
  onChange,
}: {
  label: string;
  eintraege: { id: string; name: string }[];
  gewaehlt: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="grid gap-1">
      <legend className="text-sm text-muted">{label}</legend>
      <div className="scroll-thin max-h-36 overflow-auto rounded-xl border border-line p-2">
        {eintraege.length === 0 && <p className="px-1 py-2 text-sm text-muted">Nichts angelegt.</p>}
        {eintraege.map((eintrag) => {
          const an = gewaehlt.includes(eintrag.id);
          return (
            <label key={eintrag.id} className="flex min-h-11 items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                className="size-4 accent-wax"
                checked={an}
                onChange={() =>
                  onChange(an ? gewaehlt.filter((id) => id !== eintrag.id) : [...gewaehlt, eintrag.id])
                }
              />
              {eintrag.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function BedingungsForm({
  wert,
  onChange,
  projekt,
  optional = false,
}: {
  wert?: Bedingung;
  onChange: (bedingung: Bedingung | undefined) => void;
  projekt: Projekt;
  optional?: boolean;
}) {
  const art = wert?.art ?? "immer";
  return (
    <div className="grid gap-2 rounded-xl border border-line bg-surface p-3">
      <p className="text-xs text-muted">{bedingungText(wert, projekt)}</p>
      <Feld label="Bedingung">
        <select
          value={art}
          onChange={(event) => {
            const naechste = event.target.value;
            if (naechste === "immer") onChange(undefined);
            else onChange(standardBedingung(naechste as Bedingung["art"], projekt));
          }}
        >
          {optional && <option value="immer">immer</option>}
          <option value="flag">Flag</option>
          <option value="item">Gegenstand</option>
          <option value="szene">Ort besucht</option>
          <option value="npc">NPC gesprochen</option>
        </select>
      </Feld>
      {wert?.art === "flag" && (
        <div className="grid gap-2 sm:grid-cols-3">
          <Feld label="Variable">
            <select
              value={wert.key}
              onChange={(event) => {
                const variable = projekt.variablen.find((eintrag) => eintrag.name === event.target.value);
                onChange({ ...wert, key: event.target.value, wert: variable?.standard ?? wert.wert });
              }}
            >
              {projekt.variablen.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </select>
          </Feld>
          <Feld label="Vergleich">
            <select value={wert.op} onChange={(event) => onChange({ ...wert, op: event.target.value as Vergleich })}>
              <option value="eq">gleich</option>
              <option value="neq">ungleich</option>
              <option value="gte">mindestens</option>
              <option value="lte">höchstens</option>
            </select>
          </Feld>
          <Feld label="Wert">
            {typeof wert.wert === "boolean" ? (
              <select value={String(wert.wert)} onChange={(event) => onChange({ ...wert, wert: event.target.value === "true" })}>
                <option value="true">ja</option>
                <option value="false">nein</option>
              </select>
            ) : (
              <input
                value={String(wert.wert)}
                onChange={(event) => {
                  const roh = event.target.value;
                  const zahl = Number(roh);
                  onChange({ ...wert, wert: typeof wert.wert === "number" && roh.trim() !== "" && !Number.isNaN(zahl) ? zahl : roh });
                }}
              />
            )}
          </Feld>
        </div>
      )}
      {wert?.art === "item" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Feld label="Gegenstand">
            <select value={wert.itemId} onChange={(event) => onChange({ ...wert, itemId: event.target.value })}>
              {projekt.gegenstaende.map((gegenstand) => (
                <option key={gegenstand.id} value={gegenstand.id}>
                  {gegenstand.name}
                </option>
              ))}
            </select>
          </Feld>
          <Feld label="Besitz">
            <select value={wert.hat ? "ja" : "nein"} onChange={(event) => onChange({ ...wert, hat: event.target.value === "ja" })}>
              <option value="ja">im Inventar</option>
              <option value="nein">nicht dabei</option>
            </select>
          </Feld>
        </div>
      )}
      {wert?.art === "szene" && (
        <Feld label="Ort">
          <select value={wert.szeneId} onChange={(event) => onChange({ ...wert, szeneId: event.target.value })}>
            {projekt.szenen.map((szene) => (
              <option key={szene.id} value={szene.id}>
                {szene.name}
              </option>
            ))}
          </select>
        </Feld>
      )}
      {wert?.art === "npc" && (
        <Feld label="NPC">
          <select value={wert.npcId} onChange={(event) => onChange({ ...wert, npcId: event.target.value })}>
            {projekt.npcs.map((npc) => (
              <option key={npc.id} value={npc.id}>
                {npc.name}
              </option>
            ))}
          </select>
        </Feld>
      )}
    </div>
  );
}

export function VariablenForm({
  paar,
  onChange,
  projekt,
}: {
  paar: { key: string; wert: Wert }[];
  onChange: (paar: { key: string; wert: Wert }[]) => void;
  projekt: Projekt;
}) {
  return (
    <div className="grid gap-2">
      {paar.map((eintrag, index) => (
        <div key={`${eintrag.key}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <select
            value={eintrag.key}
            onChange={(event) => {
              const variable = projekt.variablen.find((v) => v.name === event.target.value);
              const naechste = [...paar];
              naechste[index] = { key: event.target.value, wert: variable?.standard ?? eintrag.wert };
              onChange(naechste);
            }}
          >
            {projekt.variablen.map((variable) => (
              <option key={variable.id} value={variable.name}>
                {variable.name}
              </option>
            ))}
          </select>
          <input
            value={String(eintrag.wert)}
            onChange={(event) => {
              const variable = projekt.variablen.find((v) => v.name === eintrag.key);
              const roh = event.target.value;
              let wert: Wert = roh;
              if (variable?.typ === "bool") wert = roh === "true" || roh === "ja";
              if (variable?.typ === "number") wert = Number(roh);
              const naechste = [...paar];
              naechste[index] = { ...eintrag, wert };
              onChange(naechste);
            }}
          />
          <Btn tone="ghost" onClick={() => onChange(paar.filter((_, i) => i !== index))} aria-label="Variable entfernen">
            ×
          </Btn>
        </div>
      ))}
      <Btn
        onClick={() => {
          const variable = projekt.variablen[0];
          if (!variable) return;
          onChange([...paar, { key: variable.name, wert: variable.standard }]);
        }}
      >
        Variable setzen
      </Btn>
    </div>
  );
}
