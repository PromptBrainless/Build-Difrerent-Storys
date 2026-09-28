import { useState } from "react";
import type { Ereignis, EreignisTyp } from "@/lib/types";
import { neueId, ohneEreignis } from "@/lib/refs";
import { Btn, Feld, IdHaken, Zweispalter } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

const TYPEN: EreignisTyp[] = ["dialog", "wuerfel", "szene_wechsel", "flag_set", "custom"];

export function EreignisEditor() {
  const projekt = useEditor((s) => s.projekt);
  const update = useEditor((s) => s.update);
  const [wahl, setWahl] = useState(projekt.ereignisse[0]?.id ?? "");
  const ereignis = projekt.ereignisse.find((eintrag) => eintrag.id === wahl) ?? projekt.ereignisse[0];

  function setze(fn: (eintrag: Ereignis) => Ereignis) {
    if (!ereignis) return;
    update((p) => ({ ...p, ereignisse: p.ereignisse.map((eintrag) => (eintrag.id === ereignis.id ? fn(eintrag) : eintrag)) }));
  }

  return (
    <div className="p-3">
      <Zweispalter
        liste={
          <>
            <Btn tone="wax" onClick={() => {
              const id = neueId("ev");
              update((p) => ({ ...p, ereignisse: [...p.ereignisse, { id, name: "Neues Ereignis", typ: "custom", notiz: "", folgeIds: [] }] }));
              setWahl(id);
            }}>Ereignis</Btn>
            {projekt.ereignisse.map((eintrag) => (
              <button key={eintrag.id} type="button" onClick={() => setWahl(eintrag.id)} className={`min-h-11 rounded-xl border px-3 text-left text-sm ${ereignis?.id === eintrag.id ? "border-wax text-fg" : "border-line text-muted"}`}>
                <span className="block">{eintrag.name}</span>
                <span className="text-xs text-muted">{eintrag.typ}</span>
              </button>
            ))}
          </>
        }
        kinder={
          ereignis ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2 text-sm text-muted">
                <span className="rounded-full border border-wax px-3 py-1 text-fg">{ereignis.name}</span>
                {ereignis.folgeIds.map((id) => (
                  <span key={id} className="rounded-full border border-line px-3 py-1">→ {projekt.ereignisse.find((e) => e.id === id)?.name ?? id}</span>
                ))}
              </div>
              <Feld label="Name">
                <input value={ereignis.name} onChange={(event) => setze((eintrag) => ({ ...eintrag, name: event.target.value }))} />
              </Feld>
              <Feld label="Typ">
                <select value={ereignis.typ} onChange={(event) => setze((eintrag) => ({ ...eintrag, typ: event.target.value as EreignisTyp }))}>
                  {TYPEN.map((typ) => <option key={typ} value={typ}>{typ}</option>)}
                </select>
              </Feld>
              {ereignis.typ === "dialog" && (
                <>
                  <Feld label="NPC">
                    <select value={ereignis.npcId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, npcId: event.target.value || undefined }))}>
                      <option value="">keiner</option>
                      {projekt.npcs.map((npc) => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
                    </select>
                  </Feld>
                  <Feld label="Dialog">
                    <select value={ereignis.dialogId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, dialogId: event.target.value || undefined }))}>
                      <option value="">keiner</option>
                      {projekt.dialoge.map((dialog) => <option key={dialog.id} value={dialog.id}>{dialog.label}</option>)}
                    </select>
                  </Feld>
                </>
              )}
              {ereignis.typ === "wuerfel" && (
                <Feld label="Probe">
                  <select value={ereignis.probeId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, probeId: event.target.value || undefined }))}>
                    <option value="">keine</option>
                    {projekt.proben.map((probe) => <option key={probe.id} value={probe.id}>{probe.name}</option>)}
                  </select>
                </Feld>
              )}
              {ereignis.typ === "szene_wechsel" && (
                <Feld label="Zielort">
                  <select value={ereignis.zielSzeneId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, zielSzeneId: event.target.value || undefined }))}>
                    <option value="">keiner</option>
                    {projekt.szenen.map((szene) => <option key={szene.id} value={szene.id}>{szene.name}</option>)}
                  </select>
                </Feld>
              )}
              {ereignis.typ === "flag_set" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Feld label="Variable">
                    <select value={ereignis.flagKey ?? ""} onChange={(event) => {
                      const variable = projekt.variablen.find((v) => v.name === event.target.value);
                      setze((eintrag) => ({ ...eintrag, flagKey: event.target.value, flagWert: variable?.standard ?? true }));
                    }}>
                      {projekt.variablen.map((variable) => <option key={variable.id} value={variable.name}>{variable.name}</option>)}
                    </select>
                  </Feld>
                  <Feld label="Wert">
                    <input value={String(ereignis.flagWert ?? "")} onChange={(event) => {
                      const variable = projekt.variablen.find((v) => v.name === ereignis.flagKey);
                      const roh = event.target.value;
                      const wert = variable?.typ === "bool" ? roh === "true" || roh === "ja" : variable?.typ === "number" ? Number(roh) : roh;
                      setze((eintrag) => ({ ...eintrag, flagWert: wert }));
                    }} />
                  </Feld>
                </div>
              )}
              {ereignis.typ === "custom" && (
                <Feld label="Notiz im Protokoll">
                  <textarea value={ereignis.notiz ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, notiz: event.target.value }))} />
                </Feld>
              )}
              <IdHaken
                label="Danach"
                eintraege={projekt.ereignisse.filter((e) => e.id !== ereignis.id).map((e) => ({ id: e.id, name: e.name }))}
                gewaehlt={ereignis.folgeIds}
                onChange={(ids) => setze((eintrag) => ({ ...eintrag, folgeIds: ids }))}
              />
              <Btn onClick={() => { update((p) => ohneEreignis(p, ereignis.id)); setWahl(""); }}>Ereignis löschen</Btn>
            </div>
          ) : <p className="text-muted">Noch kein Ereignis.</p>
        }
      />
    </div>
  );
}
