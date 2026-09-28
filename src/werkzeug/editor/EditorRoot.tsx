import { useEffect, useRef, useState } from "react";
import { Braces, Dices, Images, Map, Play, ScrollText, Users, Zap } from "lucide-react";
import { istProjekt, projektExport } from "@/lib/storage";
import { AssetBrowser } from "@/werkzeug/editor/asset-browser/AssetBrowser";
import { EreignisEditor } from "@/werkzeug/editor/ereignis-editor/EreignisEditor";
import { NpcEditor } from "@/werkzeug/editor/npc-editor/NpcEditor";
import { ProbenEditor } from "@/werkzeug/editor/proben-editor/ProbenEditor";
import { QuestEditor } from "@/werkzeug/editor/quest-editor/QuestEditor";
import { SzenenEditor } from "@/werkzeug/editor/szenen-editor/SzenenEditor";
import { useEditor, type TabId } from "@/werkzeug/editor/state";
import { Btn, Siegel } from "@/werkzeug/editor/ui/panels/felder";
import { VariablenEditor } from "@/werkzeug/editor/variablen-editor/VariablenEditor";
import { SpielerAnsicht } from "@/spiel/SpielerAnsicht";

const TABS: { id: TabId; label: string; icon: typeof Map }[] = [
  { id: "szenen", label: "Szenen", icon: Map },
  { id: "assets", label: "Assets", icon: Images },
  { id: "npcs", label: "NPCs", icon: Users },
  { id: "quests", label: "Quests", icon: ScrollText },
  { id: "ereignisse", label: "Ereignisse", icon: Zap },
  { id: "proben", label: "Proben", icon: Dices },
  { id: "variablen", label: "Variablen", icon: Braces },
  { id: "testen", label: "Testen", icon: Play },
];

export function EditorRoot() {
  const projekt = useEditor((s) => s.projekt);
  const tab = useEditor((s) => s.tab);
  const setTab = useEditor((s) => s.setTab);
  const update = useEditor((s) => s.update);
  const beispiel = useEditor((s) => s.beispiel);
  const importieren = useEditor((s) => s.importieren);
  const datei = useRef<HTMLInputElement>(null);
  const [sicher, setSicher] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    void useEditor.persist.rehydrate();
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-3 py-2">
        <Siegel />
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-muted">Build Your Story</p>
          <input
            aria-label="Geschichtenname"
            className="titel-feld"
            value={projekt.name}
            onChange={(event) => update((p) => ({ ...p, name: event.target.value }))}
          />
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Btn onClick={() => projektExport(projekt)}>Export</Btn>
          <Btn onClick={() => datei.current?.click()}>Import</Btn>
          <input
            ref={datei}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(event) => {
              const lese = event.target.files?.[0];
              event.target.value = "";
              if (!lese) return;
              void lese.text().then((text) => {
                try {
                  const daten: unknown = JSON.parse(text);
                  if (!istProjekt(daten)) {
                    setFehler("Das ist kein Geschichtenpaket im Format 1.");
                    return;
                  }
                  setFehler("");
                  importieren(daten);
                } catch {
                  setFehler("Die Datei ließ sich nicht lesen.");
                }
              });
            }}
          />
          {sicher ? (
            <Btn tone="wax" onClick={() => { beispiel(); setSicher(false); }}>Lindendorf wiederherstellen</Btn>
          ) : (
            <Btn onClick={() => setSicher(true)}>Beispiel</Btn>
          )}
        </div>
      </header>
      {fehler && <p className="border-b border-line px-3 py-2 text-sm text-wax">{fehler}</p>}
      <nav className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2" aria-label="Werkstatt">
        {TABS.map((eintrag) => {
          const Icon = eintrag.icon;
          const aktiv = tab === eintrag.id;
          return (
            <button
              key={eintrag.id}
              type="button"
              aria-current={aktiv ? "page" : undefined}
              onClick={() => setTab(eintrag.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm ${aktiv ? "bg-raised text-fg" : "text-muted"}`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {eintrag.label}
            </button>
          );
        })}
      </nav>
      <main className="min-h-0 min-w-0 flex-1 overflow-auto">
        {tab === "szenen" && <SzenenEditor />}
        {tab === "assets" && <AssetBrowser />}
        {tab === "npcs" && <NpcEditor />}
        {tab === "quests" && <QuestEditor />}
        {tab === "ereignisse" && <EreignisEditor />}
        {tab === "proben" && <ProbenEditor />}
        {tab === "variablen" && <VariablenEditor />}
        {tab === "testen" && <SpielerAnsicht />}
      </main>
    </div>
  );
}
