import { useState } from "react";
import type { Quest, QuestStatus } from "@/lib/types";
import { neueId } from "@/lib/refs";
import { bedingungText, standardBedingung } from "@/spiel/engine/quest";
import { BedingungsForm, Btn, Feld, IdHaken } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

const STATUS: Record<QuestStatus, string> = {
  nicht_gestartet: "nicht gestartet",
  aktiv: "aktiv",
  abgeschlossen: "abgeschlossen",
  gescheitert: "gescheitert",
};

export function QuestEditor() {
  const projekt = useEditor((s) => s.projekt);
  const spiel = useEditor((s) => s.spiel);
  const update = useEditor((s) => s.update);
  const [kapitelId, setKapitelId] = useState(projekt.kapitel[0]?.id ?? "");
  const [questId, setQuestId] = useState(projekt.quests[0]?.id ?? "");
  const kapitel = projekt.kapitel.find((eintrag) => eintrag.id === kapitelId) ?? projekt.kapitel[0];
  const quests = projekt.quests.filter((quest) => quest.kapitelId === kapitel?.id);
  const quest = projekt.quests.find((eintrag) => eintrag.id === questId) ?? quests[0];

  function setze(fn: (quest: Quest) => Quest) {
    if (!quest) return;
    update((p) => ({ ...p, quests: p.quests.map((eintrag) => (eintrag.id === quest.id ? fn(eintrag) : eintrag)) }));
  }

  return (
    <div className="grid gap-4 p-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="grid content-start gap-4">
        {projekt.kapitel.map((eintrag) => (
          <section key={eintrag.id} className="border-l-2 border-wax pl-3">
            <button type="button" className="min-h-11 text-left font-display text-xl" onClick={() => setKapitelId(eintrag.id)}>
              {eintrag.name}
            </button>
            <div className="mt-2 grid gap-1">
              {projekt.quests.filter((q) => q.kapitelId === eintrag.id).map((q) => {
                const status = spiel.questStatus[q.id] ?? "nicht_gestartet";
                return (
                  <button key={q.id} type="button" onClick={() => { setKapitelId(eintrag.id); setQuestId(q.id); }} className={`min-h-11 rounded-xl border px-3 text-left text-sm ${quest?.id === q.id ? "border-wax" : "border-line"}`}>
                    <span className="block text-fg">{q.name}</span>
                    <span className="text-xs text-muted">{STATUS[status]}</span>
                  </button>
                );
              })}
            </div>
            <Btn className="mt-2" onClick={() => {
              const id = neueId("q");
              update((p) => ({
                ...p,
                quests: [...p.quests, {
                  id,
                  kapitelId: eintrag.id,
                  name: "Neue Quest",
                  beschreibung: "",
                  startBedingungen: [],
                  tasks: [],
                  belohnung: { items: [], flags: [], xp: 0 },
                  zielSzeneIds: [],
                }],
              }));
              setQuestId(id);
            }}>Quest</Btn>
          </section>
        ))}
        <Btn onClick={() => update((p) => ({ ...p, kapitel: [...p.kapitel, { id: neueId("k"), name: "Neues Kapitel" }] }))}>Kapitel</Btn>
      </div>
      {quest && kapitel ? (
        <div className="grid content-start gap-3">
          <Feld label="Kapitelname">
            <input value={kapitel.name} onChange={(event) => update((p) => ({ ...p, kapitel: p.kapitel.map((eintrag) => eintrag.id === kapitel.id ? { ...eintrag, name: event.target.value } : eintrag) }))} />
          </Feld>
          <Feld label="Quest">
            <input value={quest.name} onChange={(event) => setze((eintrag) => ({ ...eintrag, name: event.target.value }))} />
          </Feld>
          <Feld label="Beschreibung">
            <textarea value={quest.beschreibung} onChange={(event) => setze((eintrag) => ({ ...eintrag, beschreibung: event.target.value }))} />
          </Feld>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-xl">Start</h2>
              <Btn onClick={() => setze((eintrag) => ({ ...eintrag, startBedingungen: [...eintrag.startBedingungen, standardBedingung("flag", projekt)] }))}>Bedingung</Btn>
            </div>
            {quest.startBedingungen.length === 0 && <p className="text-sm text-muted">Ohne Bedingung beginnt die Quest mit dem Spiel.</p>}
            {quest.startBedingungen.map((bedingung, index) => (
              <div key={`${bedingung.art}-${index}`} className="mb-2">
                <BedingungsForm
                  wert={bedingung}
                  projekt={projekt}
                  onChange={(naechste) => setze((eintrag) => ({
                    ...eintrag,
                    startBedingungen: naechste ? eintrag.startBedingungen.map((alt, i) => i === index ? naechste : alt) : eintrag.startBedingungen.filter((_, i) => i !== index),
                  }))}
                  optional
                />
              </div>
            ))}
          </div>
          <div className="border-l-2 border-line pl-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-xl">Schritte</h2>
              <Btn onClick={() => setze((eintrag) => ({ ...eintrag, tasks: [...eintrag.tasks, { id: neueId("t"), beschreibung: "Neuer Schritt", bedingung: standardBedingung("flag", projekt) }] }))}>Schritt</Btn>
            </div>
            {quest.tasks.map((task) => (
              <article key={task.id} className="mb-3 grid gap-2 rounded-xl border border-line p-3">
                <Feld label="Text">
                  <input value={task.beschreibung} onChange={(event) => setze((eintrag) => ({ ...eintrag, tasks: eintrag.tasks.map((alt) => alt.id === task.id ? { ...alt, beschreibung: event.target.value } : alt) }))} />
                </Feld>
                <p className="text-xs text-muted">{bedingungText(task.bedingung, projekt)}</p>
                <BedingungsForm wert={task.bedingung} projekt={projekt} onChange={(naechste) => { if (!naechste) return; setze((eintrag) => ({ ...eintrag, tasks: eintrag.tasks.map((alt) => alt.id === task.id ? { ...alt, bedingung: naechste } : alt) })); }} />
                <Feld label="Ereignis bei Abschluss">
                  <select value={task.ereignisId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, tasks: eintrag.tasks.map((alt) => alt.id === task.id ? { ...alt, ereignisId: event.target.value || undefined } : alt) }))}>
                    <option value="">keins</option>
                    {projekt.ereignisse.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </Feld>
                <Btn onClick={() => setze((eintrag) => ({ ...eintrag, tasks: eintrag.tasks.filter((alt) => alt.id !== task.id) }))}>Schritt löschen</Btn>
              </article>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Feld label="XP">
              <input type="number" value={quest.belohnung.xp} onChange={(event) => setze((eintrag) => ({ ...eintrag, belohnung: { ...eintrag.belohnung, xp: Number(event.target.value) } }))} />
            </Feld>
            <Feld label="Startperson">
              <select value={quest.startNpcId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, startNpcId: event.target.value || undefined }))}>
                <option value="">keine</option>
                {projekt.npcs.map((npc) => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
              </select>
            </Feld>
            <Feld label="Abgabe">
              <select value={quest.abgabeNpcId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, abgabeNpcId: event.target.value || undefined }))}>
                <option value="">keine</option>
                {projekt.npcs.map((npc) => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
              </select>
            </Feld>
            <Feld label="Startort">
              <select value={quest.startSzeneId ?? ""} onChange={(event) => setze((eintrag) => ({ ...eintrag, startSzeneId: event.target.value || undefined }))}>
                <option value="">keiner</option>
                {projekt.szenen.map((szene) => <option key={szene.id} value={szene.id}>{szene.name}</option>)}
              </select>
            </Feld>
          </div>
          <IdHaken label="Zielorte" eintraege={projekt.szenen.map((s) => ({ id: s.id, name: s.name }))} gewaehlt={quest.zielSzeneIds} onChange={(ids) => setze((eintrag) => ({ ...eintrag, zielSzeneIds: ids }))} />
          <IdHaken label="Belohnung" eintraege={projekt.gegenstaende.map((g) => ({ id: g.id, name: g.name }))} gewaehlt={quest.belohnung.items} onChange={(ids) => setze((eintrag) => ({ ...eintrag, belohnung: { ...eintrag.belohnung, items: ids } }))} />
          <Btn onClick={() => { update((p) => ({ ...p, quests: p.quests.filter((eintrag) => eintrag.id !== quest.id) })); setQuestId(""); }}>Quest löschen</Btn>
        </div>
      ) : <p className="text-muted">Lege ein Kapitel und eine Quest an.</p>}
    </div>
  );
}
