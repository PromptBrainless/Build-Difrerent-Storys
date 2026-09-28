import { useState } from "react";
import type { AssetTyp } from "@/lib/types";
import { bildAusDatei } from "@/lib/platform";
import { neueId, ohneAsset, ohneGegenstand } from "@/lib/refs";
import { Btn, Feld, Zweispalter } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

const TYPEN: Array<AssetTyp | "alle"> = ["alle", "hintergrund", "portrait", "wissen", "sonstiges"];

export function AssetBrowser() {
  const projekt = useEditor((s) => s.projekt);
  const update = useEditor((s) => s.update);
  const [suche, setSuche] = useState("");
  const [typ, setTyp] = useState<AssetTyp | "alle">("alle");
  const [wahl, setWahl] = useState(projekt.assets[0]?.id ?? "");
  const [hinweis, setHinweis] = useState("");
  const q = suche.trim().toLowerCase();
  const liste = projekt.assets.filter((asset) => {
    if (typ !== "alle" && asset.typ !== typ) return false;
    if (!q) return true;
    return asset.name.toLowerCase().includes(q) || asset.tags.some((tag) => tag.toLowerCase().includes(q));
  });
  const asset = projekt.assets.find((eintrag) => eintrag.id === wahl);

  async function uebernehmen(dateien: FileList | File[]) {
    setHinweis("");
    for (const datei of dateien) {
      try {
        const pfad = await bildAusDatei(datei);
        const id = neueId("a");
        update((p) => ({
          ...p,
          assets: [...p.assets, { id, name: datei.name.replace(/\.[^.]+$/, ""), typ: "sonstiges", quelle: "lokal", pfad, tags: [] }],
        }));
        setWahl(id);
      } catch (fehler) {
        setHinweis(fehler instanceof Error ? fehler.message : "Upload fehlgeschlagen.");
      }
    }
  }

  return (
    <div className="grid gap-4 p-3">
      <div
        className="rounded-2xl border border-dashed border-line bg-surface p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uebernehmen(event.dataTransfer.files);
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="font-display text-2xl">Assets</h2>
            <p className="text-sm text-muted">Bilder aus der Galerie oder per Ziehen. Quelle bleibt am Asset hängen.</p>
          </div>
          <label className="ml-auto inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-wax px-4 text-sm font-medium text-ink">
            Bild wählen
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => { if (event.target.files) void uebernehmen(event.target.files); event.target.value = ""; }} />
          </label>
        </div>
        {hinweis && <p className="mt-2 text-sm text-wax">{hinweis}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="max-w-xs" placeholder="Suchen" value={suche} onChange={(event) => setSuche(event.target.value)} aria-label="Assets suchen" />
        {TYPEN.map((eintrag) => (
          <button key={eintrag} type="button" onClick={() => setTyp(eintrag)} className={`min-h-11 rounded-full px-3 text-sm ${typ === eintrag ? "bg-wax text-ink" : "border border-line text-muted"}`}>
            {eintrag}
          </button>
        ))}
      </div>
      <Zweispalter
        liste={
          <div className="grid grid-cols-2 gap-2">
            {liste.map((eintrag) => (
              <button key={eintrag.id} type="button" onClick={() => setWahl(eintrag.id)} className={`overflow-hidden rounded-xl border text-left ${wahl === eintrag.id ? "border-wax" : "border-line"}`}>
                <img src={eintrag.pfad} alt="" className="aspect-video w-full object-cover" />
                <span className="block px-2 py-2 text-sm text-fg">{eintrag.name}</span>
              </button>
            ))}
          </div>
        }
        kinder={
          asset ? (
            <div className="grid gap-3">
              <img src={asset.pfad} alt={asset.name} className="max-h-64 w-full rounded-2xl object-cover" />
              <Feld label="Name">
                <input value={asset.name} onChange={(event) => update((p) => ({ ...p, assets: p.assets.map((eintrag) => eintrag.id === asset.id ? { ...eintrag, name: event.target.value } : eintrag) }))} />
              </Feld>
              <Feld label="Typ">
                <select value={asset.typ} onChange={(event) => update((p) => ({ ...p, assets: p.assets.map((eintrag) => eintrag.id === asset.id ? { ...eintrag, typ: event.target.value as AssetTyp } : eintrag) }))}>
                  <option value="hintergrund">hintergrund</option>
                  <option value="portrait">portrait</option>
                  <option value="wissen">wissen</option>
                  <option value="sonstiges">sonstiges</option>
                </select>
              </Feld>
              <Feld label="Tags, durch Komma">
                <input value={asset.tags.join(", ")} onChange={(event) => update((p) => ({ ...p, assets: p.assets.map((eintrag) => eintrag.id === asset.id ? { ...eintrag, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) } : eintrag) }))} />
              </Feld>
              <p className="text-sm text-muted">Quelle: {asset.quelle}</p>
              <Btn onClick={() => { update((p) => ohneAsset(p, asset.id)); setWahl(""); }}>Asset löschen</Btn>
            </div>
          ) : <p className="text-muted">Kein Asset gewählt.</p>
        }
      />
      <div className="grid gap-3 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl">Gegenstände</h2>
          <Btn onClick={() => update((p) => ({ ...p, gegenstaende: [...p.gegenstaende, { id: neueId("g"), name: "Neues Ding", beschreibung: "", assetId: p.assets[0]?.id }] }))}>Anlegen</Btn>
        </div>
        {projekt.gegenstaende.map((gegenstand) => (
          <div key={gegenstand.id} className="grid gap-2 rounded-xl border border-line p-3 md:grid-cols-2">
            <Feld label="Name">
              <input value={gegenstand.name} onChange={(event) => update((p) => ({ ...p, gegenstaende: p.gegenstaende.map((eintrag) => eintrag.id === gegenstand.id ? { ...eintrag, name: event.target.value } : eintrag) }))} />
            </Feld>
            <Feld label="Bild">
              <select value={gegenstand.assetId ?? ""} onChange={(event) => update((p) => ({ ...p, gegenstaende: p.gegenstaende.map((eintrag) => eintrag.id === gegenstand.id ? { ...eintrag, assetId: event.target.value || undefined } : eintrag) }))}>
                <option value="">keins</option>
                {projekt.assets.map((eintrag) => <option key={eintrag.id} value={eintrag.id}>{eintrag.name}</option>)}
              </select>
            </Feld>
            <Feld label="Beschreibung">
              <input value={gegenstand.beschreibung} onChange={(event) => update((p) => ({ ...p, gegenstaende: p.gegenstaende.map((eintrag) => eintrag.id === gegenstand.id ? { ...eintrag, beschreibung: event.target.value } : eintrag) }))} />
            </Feld>
            <Btn onClick={() => update((p) => ohneGegenstand(p, gegenstand.id))}>Entfernen</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}
