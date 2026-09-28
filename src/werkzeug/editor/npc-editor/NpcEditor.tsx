import { useState } from "react";
import type { Dialog, DialogZeile } from "@/lib/types";
import { neueId, ohneNpc } from "@/lib/refs";
import { alsSkript } from "@/spiel/engine/dialog";
import { portraitPfad } from "@/spiel/engine/npc";
import { BedingungsForm, Btn, Feld, IdHaken, VariablenForm, Zweispalter } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

export function NpcEditor() {
  const projekt = useEditor((s) => s.projekt);
  const update = useEditor((s) => s.update);
  const [npcId, setNpcId] = useState(projekt.npcs[0]?.id ?? "");
  const [skript, setSkript] = useState(false);
  const npc = projekt.npcs.find((eintrag) => eintrag.id === npcId) ?? projekt.npcs[0];
  const dialog = projekt.dialoge.find((eintrag) => eintrag.id === npc?.dialogId);

  function setzeDialog(fn: (dialog: Dialog) => Dialog) {
    if (!dialog) return;
    update((p) => ({ ...p, dialoge: p.dialoge.map((eintrag) => (eintrag.id === dialog.id ? fn(eintrag) : eintrag)) }));
  }

  function setzeZeile(id: string, fn: (zeile: DialogZeile) => DialogZeile) {
    setzeDialog((aktuell) => ({ ...aktuell, zeilen: aktuell.zeilen.map((zeile) => (zeile.id === id ? fn(zeile) : zeile)) }));
  }

  return (
    <div className="p-3">
      <Zweispalter
        liste={
          <>
            <Btn tone="wax" onClick={() => {
              const id = neueId("n");
              const dialogId = neueId("d");
              const zeileId = neueId("z");
              update((p) => ({
                ...p,
                npcs: [...p.npcs, { id, name: "Neue Person", verhalten: "stationaer", dialogId }],
                dialoge: [...p.dialoge, { id: dialogId, label: "neu", zeilen: [{ id: zeileId, sprecher: "Neue Person", text: "…", choices: [], variablen: [] }] }],
              }));
              setNpcId(id);
            }}>Person</Btn>
            {projekt.npcs.map((eintrag) => (
              <button key={eintrag.id} type="button" onClick={() => setNpcId(eintrag.id)} className={`flex min-h-11 items-center gap-2 rounded-xl border px-2 text-left text-sm ${npc?.id === eintrag.id ? "border-wax" : "border-line"}`}>
                {eintrag.portraitAssetId && <img src={projekt.assets.find((a) => a.id === eintrag.portraitAssetId)?.pfad} alt="" className="size-8 rounded-full object-cover" />}
                {eintrag.name}
              </button>
            ))}
          </>
        }
        kinder={
          npc && dialog ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-end gap-3">
                {portraitPfad(projekt, npc) && <img src={portraitPfad(projekt, npc)} alt="" className="h-24 w-16 rounded-xl object-cover" />}
                <Feld label="Name">
                  <input value={npc.name} onChange={(event) => {
                    const name = event.target.value;
                    update((p) => ({
                      ...p,
                      npcs: p.npcs.map((eintrag) => eintrag.id === npc.id ? { ...eintrag, name } : eintrag),
                      dialoge: p.dialoge.map((eintrag) => eintrag.id !== npc.dialogId ? eintrag : { ...eintrag, zeilen: eintrag.zeilen.map((zeile) => zeile.sprecher === npc.name ? { ...zeile, sprecher: name } : zeile) }),
                    }));
                  }} />
                </Feld>
                <Feld label="Verhalten">
                  <select value={npc.verhalten} onChange={(event) => update((p) => ({ ...p, npcs: p.npcs.map((eintrag) => eintrag.id === npc.id ? { ...eintrag, verhalten: event.target.value as typeof npc.verhalten } : eintrag) }))}>
                    <option value="stationaer">stationär</option>
                    <option value="patrol">patrol</option>
                    <option value="custom">custom</option>
                  </select>
                </Feld>
                <Feld label="Portrait">
                  <select value={npc.portraitAssetId ?? ""} onChange={(event) => update((p) => ({ ...p, npcs: p.npcs.map((eintrag) => eintrag.id === npc.id ? { ...eintrag, portraitAssetId: event.target.value || undefined } : eintrag) }))}>
                    <option value="">keins</option>
                    {projekt.assets.filter((asset) => asset.typ === "portrait" || asset.typ === "sonstiges").map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </Feld>
              </div>
              <div className="flex flex-wrap gap-2">
                <Feld label="Label">
                  <input value={dialog.label} onChange={(event) => setzeDialog((eintrag) => ({ ...eintrag, label: event.target.value }))} />
                </Feld>
                <Btn onClick={() => setSkript((wert) => !wert)}>{skript ? "Formular" : "Skript"}</Btn>
                <Btn onClick={() => setzeDialog((eintrag) => ({ ...eintrag, zeilen: [...eintrag.zeilen, { id: neueId("z"), sprecher: npc.name, text: "…", choices: [], variablen: [] }] }))}>Zeile</Btn>
              </div>
              {skript ? (
                <pre className="whitespace-pre-wrap rounded-2xl bg-paper p-4 text-sm text-ink">{alsSkript(dialog)}</pre>
              ) : (
                dialog.zeilen.map((zeile, index) => (
                  <article key={zeile.id} className="grid gap-3 rounded-2xl border border-line bg-surface p-3">
                    <p className="text-xs text-muted">Zeile {index + 1} · {zeile.id}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Feld label="Sprecher">
                        <input value={zeile.sprecher} onChange={(event) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, sprecher: event.target.value }))} />
                      </Feld>
                      <Feld label="Text">
                        <textarea value={zeile.text} onChange={(event) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, text: event.target.value }))} />
                      </Feld>
                    </div>
                    <VariablenForm paar={zeile.variablen} projekt={projekt} onChange={(paar) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, variablen: paar }))} />
                    {zeile.choices.map((choice) => (
                      <div key={choice.id} className="grid gap-2 rounded-xl border border-line p-3">
                        <Feld label="Antwort">
                          <input value={choice.text} onChange={(event) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: eintrag.choices.map((alt) => alt.id === choice.id ? { ...alt, text: event.target.value } : alt) }))} />
                        </Feld>
                        <Feld label="Nächste Zeile">
                          <select value={choice.naechsteId ?? ""} onChange={(event) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: eintrag.choices.map((alt) => alt.id === choice.id ? { ...alt, naechsteId: event.target.value || undefined } : alt) }))}>
                            <option value="">Dialog schließen</option>
                            {dialog.zeilen.map((ziel) => <option key={ziel.id} value={ziel.id}>{ziel.sprecher}: {ziel.text.slice(0, 42)}</option>)}
                          </select>
                        </Feld>
                        <BedingungsForm optional wert={choice.bedingung} projekt={projekt} onChange={(bedingung) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: eintrag.choices.map((alt) => alt.id === choice.id ? { ...alt, bedingung } : alt) }))} />
                        <IdHaken label="Ereignisse" eintraege={projekt.ereignisse.map((e) => ({ id: e.id, name: e.name }))} gewaehlt={choice.ereignisIds} onChange={(ids) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: eintrag.choices.map((alt) => alt.id === choice.id ? { ...alt, ereignisIds: ids } : alt) }))} />
                        <VariablenForm paar={choice.variablen} projekt={projekt} onChange={(paar) => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: eintrag.choices.map((alt) => alt.id === choice.id ? { ...alt, variablen: paar } : alt) }))} />
                        <Btn onClick={() => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: eintrag.choices.filter((alt) => alt.id !== choice.id) }))}>Antwort löschen</Btn>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <Btn onClick={() => setzeZeile(zeile.id, (eintrag) => ({ ...eintrag, choices: [...eintrag.choices, { id: neueId("c"), text: "…", ereignisIds: [], variablen: [] }] }))}>Antwort</Btn>
                      <Btn onClick={() => setzeDialog((eintrag) => ({ ...eintrag, zeilen: eintrag.zeilen.filter((alt) => alt.id !== zeile.id) }))}>Zeile löschen</Btn>
                    </div>
                  </article>
                ))
              )}
              <Btn onClick={() => { update((p) => ohneNpc(p, npc.id)); setNpcId(""); }}>Person löschen</Btn>
            </div>
          ) : <p className="text-muted">Noch niemand im Ort.</p>
        }
      />
    </div>
  );
}
