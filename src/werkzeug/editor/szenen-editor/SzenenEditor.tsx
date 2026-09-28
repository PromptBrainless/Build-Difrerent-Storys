import { useState } from "react";
import { neueId, ohneSzene } from "@/lib/refs";
import type { SzenenObjekt } from "@/lib/types";
import { hintergrundPfad } from "@/spiel/engine/scene";
import { SzenenCanvas } from "@/werkzeug/editor/ui/canvas/SzenenCanvas";
import { Btn, Feld, IdHaken } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

export function SzenenEditor() {
  const projekt = useEditor((s) => s.projekt);
  const update = useEditor((s) => s.update);
  const [szeneId, setSzeneId] = useState(projekt.startSzeneId);
  const [objektId, setObjektId] = useState<string | null>(null);
  const szene = projekt.szenen.find((eintrag) => eintrag.id === szeneId) ?? projekt.szenen[0];
  const objekt = szene?.objekte.find((eintrag) => eintrag.id === objektId);

  if (!szene) return <p className="text-muted">Noch kein Ort.</p>;

  function setze(fn: (aktuell: typeof szene) => NonNullable<typeof szene>) {
    update((p) => ({ ...p, szenen: p.szenen.map((eintrag) => (eintrag.id === szene?.id ? fn(eintrag) : eintrag)) }));
  }

  function marker(typ: SzenenObjekt["typ"]) {
    const id = neueId("o");
    const referenzId = typ === "npc" ? projekt.npcs[0]?.id : typ === "item" ? projekt.gegenstaende[0]?.id : undefined;
    const name = typ === "npc" ? "Person" : typ === "item" ? "Fund" : "Auslöser";
    setze((aktuell) => ({
      ...aktuell,
      objekte: [...aktuell.objekte, { id, typ, name, x: 30, y: 30, w: 28, h: 32, referenzId, ereignisIds: [] }],
    }));
    setObjektId(id);
  }

  return (
    <div className="grid h-full gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid content-start gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <Feld label="Ort">
            <select value={szene.id} onChange={(event) => { setSzeneId(event.target.value); setObjektId(null); }}>
              {projekt.szenen.map((eintrag) => (
                <option key={eintrag.id} value={eintrag.id}>{eintrag.name}</option>
              ))}
            </select>
          </Feld>
          <Btn onClick={() => {
            const id = neueId("s");
            update((p) => ({ ...p, szenen: [...p.szenen, { id, name: "Neuer Ort", beimBetreten: [], beimVerlassen: [], objekte: [] }] }));
            setSzeneId(id);
          }}>Ort anlegen</Btn>
          <Btn onClick={() => marker("npc")}>NPC</Btn>
          <Btn onClick={() => marker("trigger")}>Auslöser</Btn>
          <Btn onClick={() => marker("item")}>Fund</Btn>
        </div>
        <p className="text-sm text-muted">Marker anfassen und ziehen. Im Test lösen sie Ereignisse aus.</p>
        <SzenenCanvas
          pfad={hintergrundPfad(projekt, szene)}
          projekt={projekt}
          objekte={szene.objekte}
          modus="editor"
          aktivId={objektId ?? undefined}
          onSelect={setObjektId}
          onMove={(id, x, y) => setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.map((eintrag) => eintrag.id === id ? { ...eintrag, x, y } : eintrag) }))}
        />
      </div>
      <aside className="scroll-thin grid content-start gap-3 overflow-auto rounded-2xl border border-line bg-surface p-3">
        <Feld label="Name">
          <input value={szene.name} onChange={(event) => setze((aktuell) => ({ ...aktuell, name: event.target.value }))} />
        </Feld>
        <Feld label="Hintergrund">
          <select
            value={szene.hintergrundAssetId ?? ""}
            onChange={(event) => setze((aktuell) => ({ ...aktuell, hintergrundAssetId: event.target.value || undefined }))}
          >
            <option value="">keiner</option>
            {projekt.assets.filter((asset) => asset.typ === "hintergrund" || asset.typ === "sonstiges").map((asset) => (
              <option key={asset.id} value={asset.id}>{asset.name}</option>
            ))}
          </select>
        </Feld>
        <Feld label="Startort der Geschichte">
          <select value={projekt.startSzeneId} onChange={(event) => update((p) => ({ ...p, startSzeneId: event.target.value }))}>
            {projekt.szenen.map((eintrag) => (
              <option key={eintrag.id} value={eintrag.id}>{eintrag.name}</option>
            ))}
          </select>
        </Feld>
        <IdHaken
          label="Beim Betreten"
          eintraege={projekt.ereignisse.map((e) => ({ id: e.id, name: e.name }))}
          gewaehlt={szene.beimBetreten}
          onChange={(ids) => setze((aktuell) => ({ ...aktuell, beimBetreten: ids }))}
        />
        <IdHaken
          label="Beim Verlassen"
          eintraege={projekt.ereignisse.map((e) => ({ id: e.id, name: e.name }))}
          gewaehlt={szene.beimVerlassen}
          onChange={(ids) => setze((aktuell) => ({ ...aktuell, beimVerlassen: ids }))}
        />
        {objekt && (
          <div className="grid gap-3 border-t border-line pt-3">
            <h2 className="font-display text-xl text-fg">{objekt.name}</h2>
            <Feld label="Name">
              <input value={objekt.name} onChange={(event) => setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? { ...eintrag, name: event.target.value } : eintrag) }))} />
            </Feld>
            <Feld label="Art">
              <select
                value={objekt.typ}
                onChange={(event) => setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? { ...eintrag, typ: event.target.value as SzenenObjekt["typ"] } : eintrag) }))}
              >
                <option value="npc">NPC</option>
                <option value="trigger">Auslöser</option>
                <option value="item">Fund</option>
              </select>
            </Feld>
            {objekt.typ === "npc" && (
              <Feld label="Person">
                <select value={objekt.referenzId ?? ""} onChange={(event) => setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? { ...eintrag, referenzId: event.target.value || undefined } : eintrag) }))}>
                  <option value="">keine</option>
                  {projekt.npcs.map((npc) => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
                </select>
              </Feld>
            )}
            {objekt.typ === "item" && (
              <Feld label="Gegenstand">
                <select value={objekt.referenzId ?? ""} onChange={(event) => setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? { ...eintrag, referenzId: event.target.value || undefined } : eintrag) }))}>
                  <option value="">keiner</option>
                  {projekt.gegenstaende.map((gegenstand) => <option key={gegenstand.id} value={gegenstand.id}>{gegenstand.name}</option>)}
                </select>
              </Feld>
            )}
            <IdHaken
              label="Bei Interaktion"
              eintraege={projekt.ereignisse.map((e) => ({ id: e.id, name: e.name }))}
              gewaehlt={objekt.ereignisIds}
              onChange={(ids) => setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? { ...eintrag, ereignisIds: ids } : eintrag) }))}
            />
            <Btn onClick={() => { setze((aktuell) => ({ ...aktuell, objekte: aktuell.objekte.filter((eintrag) => eintrag.id !== objekt.id) })); setObjektId(null); }}>
              Marker löschen
            </Btn>
          </div>
        )}
        <Btn
          onClick={() => {
            if (projekt.szenen.length < 2) return;
            update((p) => ohneSzene(p, szene.id));
            setSzeneId(projekt.szenen.find((eintrag) => eintrag.id !== szene.id)?.id ?? "");
            setObjektId(null);
          }}
        >
          Ort löschen
        </Btn>
      </aside>
    </div>
  );
}
