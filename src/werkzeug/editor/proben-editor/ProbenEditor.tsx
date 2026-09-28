import { useState } from "react";
import { neueId, ohneProbe } from "@/lib/refs";
import { Btn, Feld, IdHaken, Zweispalter } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

export function ProbenEditor() {
  const projekt = useEditor((s) => s.projekt);
  const update = useEditor((s) => s.update);
  const [wahl, setWahl] = useState(projekt.proben[0]?.id ?? "");
  const probe = projekt.proben.find((eintrag) => eintrag.id === wahl) ?? projekt.proben[0];
  const zahlen = projekt.variablen.filter((variable) => variable.typ === "number");

  return (
    <div className="p-3">
      <Zweispalter
        liste={
          <>
            <Btn tone="wax" onClick={() => {
              const id = neueId("p");
              update((p) => ({
                ...p,
                proben: [...p.proben, { id, name: "Neue Probe", eigenschaft: zahlen[0]?.name ?? "mut", schwierigkeit: 6, erfolgEreignisIds: [], misserfolgEreignisIds: [] }],
              }));
              setWahl(id);
            }}>Probe</Btn>
            {projekt.proben.map((eintrag) => (
              <button key={eintrag.id} type="button" onClick={() => setWahl(eintrag.id)} className={`min-h-11 rounded-xl border px-3 text-left text-sm ${probe?.id === eintrag.id ? "border-wax text-fg" : "border-line text-muted"}`}>
                {eintrag.name}
              </button>
            ))}
          </>
        }
        kinder={
          probe ? (
            <div className="grid gap-3">
              <h2 className="font-display text-2xl">Würfelprobe</h2>
              <p className="text-sm text-muted">Erfolg, wenn W10 + Eigenschaft ≥ Schwierigkeit.</p>
              <Feld label="Name">
                <input value={probe.name} onChange={(event) => update((p) => ({ ...p, proben: p.proben.map((eintrag) => eintrag.id === probe.id ? { ...eintrag, name: event.target.value } : eintrag) }))} />
              </Feld>
              <Feld label="Eigenschaft">
                <select value={probe.eigenschaft} onChange={(event) => update((p) => ({ ...p, proben: p.proben.map((eintrag) => eintrag.id === probe.id ? { ...eintrag, eigenschaft: event.target.value } : eintrag) }))}>
                  {zahlen.map((variable) => <option key={variable.id} value={variable.name}>{variable.name}</option>)}
                  {zahlen.every((variable) => variable.name !== probe.eigenschaft) && <option value={probe.eigenschaft}>{probe.eigenschaft}</option>}
                </select>
              </Feld>
              <Feld label={`Schwierigkeit ${probe.schwierigkeit}`}>
                <input type="range" min={1} max={10} value={probe.schwierigkeit} onChange={(event) => update((p) => ({ ...p, proben: p.proben.map((eintrag) => eintrag.id === probe.id ? { ...eintrag, schwierigkeit: Number(event.target.value) } : eintrag) }))} />
              </Feld>
              <IdHaken label="Bei Erfolg" eintraege={projekt.ereignisse.map((e) => ({ id: e.id, name: e.name }))} gewaehlt={probe.erfolgEreignisIds} onChange={(ids) => update((p) => ({ ...p, proben: p.proben.map((eintrag) => eintrag.id === probe.id ? { ...eintrag, erfolgEreignisIds: ids } : eintrag) }))} />
              <IdHaken label="Bei Misserfolg" eintraege={projekt.ereignisse.map((e) => ({ id: e.id, name: e.name }))} gewaehlt={probe.misserfolgEreignisIds} onChange={(ids) => update((p) => ({ ...p, proben: p.proben.map((eintrag) => eintrag.id === probe.id ? { ...eintrag, misserfolgEreignisIds: ids } : eintrag) }))} />
              <Btn onClick={() => { update((p) => ohneProbe(p, probe.id)); setWahl(""); }}>Probe löschen</Btn>
            </div>
          ) : <p className="text-muted">Noch keine Probe.</p>
        }
      />
    </div>
  );
}
