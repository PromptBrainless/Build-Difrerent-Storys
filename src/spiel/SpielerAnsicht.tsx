import { useEffect } from "react";
import { bindZurueck } from "@/lib/platform";
import { textMitWerten, sichtbareChoices } from "@/spiel/engine/dialog";
import { hintergrundPfad } from "@/spiel/engine/scene";
import { portraitPfad } from "@/spiel/engine/npc";
import { SzenenCanvas } from "@/werkzeug/editor/ui/canvas/SzenenCanvas";
import { Btn } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

export function SpielerAnsicht() {
  const projekt = useEditor((s) => s.projekt);
  const spiel = useEditor((s) => s.spiel);
  const modal = useEditor((s) => s.modal);
  const slots = useEditor((s) => s.slots);
  const klick = useEditor((s) => s.klick);
  const wahl = useEditor((s) => s.wahl);
  const weiter = useEditor((s) => s.weiter);
  const wuerfle = useEditor((s) => s.wuerfle);
  const nachWurf = useEditor((s) => s.nachWurf);
  const zurueckTaste = useEditor((s) => s.zurueckTaste);
  const neuesSpiel = useEditor((s) => s.neuesSpiel);
  const speichernIn = useEditor((s) => s.speichernIn);
  const laden = useEditor((s) => s.laden);
  const setTab = useEditor((s) => s.setTab);

  useEffect(() => bindZurueck(() => {
    const blieb = useEditor.getState().zurueckTaste();
    if (!blieb) useEditor.getState().setTab("szenen");
    return true;
  }), []);

  const szene = projekt.szenen.find((eintrag) => eintrag.id === spiel.szeneId) ?? projekt.szenen[0];
  const dialog = modal?.art === "dialog" ? projekt.dialoge.find((eintrag) => eintrag.id === modal.dialogId) : undefined;
  const zeile = dialog?.zeilen.find((eintrag) => modal?.art === "dialog" && eintrag.id === modal.zeileId);
  const choices = zeile ? sichtbareChoices(zeile, spiel, projekt) : [];
  const sprecherNpc = projekt.npcs.find((npc) => npc.name === zeile?.sprecher);
  const probe = modal?.art === "wuerfel" ? projekt.proben.find((eintrag) => eintrag.id === modal.probeId) : undefined;
  const stat = probe ? Number(spiel.variablen[probe.eigenschaft] ?? 0) : 0;
  const quests = projekt.quests.filter((quest) => {
    const status = spiel.questStatus[quest.id];
    return status === "aktiv" || status === "abgeschlossen";
  });

  if (!szene) return <p className="p-4 text-muted">Kein Ort zum Testen.</p>;

  return (
    <div className="grid h-full gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="relative">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Btn onClick={() => { if (!zurueckTaste()) setTab("szenen"); }}>Zurück</Btn>
          <h2 className="font-display text-2xl">{szene.name}</h2>
          <span className="ml-auto text-sm tabular-nums text-muted">{spiel.xp} XP</span>
          <Btn onClick={neuesSpiel}>Neues Spiel</Btn>
        </div>
        <div className={modal ? "pointer-events-none" : undefined}>
          <SzenenCanvas
            pfad={hintergrundPfad(projekt, szene)}
            projekt={projekt}
            objekte={szene.objekte}
            modus="spiel"
            onActivate={klick}
          />
        </div>
        {zeile && (
          <div role="dialog" aria-label={zeile.sprecher} className="mt-3 rounded-2xl bg-paper p-4 text-ink">
            <div className="flex gap-3">
              {sprecherNpc && portraitPfad(projekt, sprecherNpc) && (
                <img src={portraitPfad(projekt, sprecherNpc)} alt="" className="h-20 w-14 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl">{zeile.sprecher}</p>
                <p className="mt-1 text-pretty leading-relaxed">{textMitWerten(zeile.text, spiel)}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {choices.map((choice) => (
                <Btn key={choice.id} tone="paper" className="border border-ink/15" onClick={() => wahl(choice.id)}>
                  {choice.text}
                </Btn>
              ))}
              {choices.length === 0 && <Btn tone="wax" onClick={weiter}>Weiter</Btn>}
            </div>
          </div>
        )}
        {modal?.art === "wuerfel" && (
          <div className="mt-3 rounded-2xl bg-paper p-4 text-ink">
            <p className="font-display text-2xl">{probe?.name ?? "Probe"}</p>
            <p className="mt-1 text-sm">
              W10 + {probe.eigenschaft.slice(0, 1).toUpperCase()}
              {probe.eigenschaft.slice(1)} ({stat}) ≥ {probe.schwierigkeit}
            </p>
            {modal.fertig ? (
              <>
                <p className="mt-3 font-display text-5xl tabular-nums">{modal.wurf}</p>
                <p className="mt-1">{modal.erfolg ? "Geschafft" : "Daneben"} · Summe {modal.summe}</p>
                <Btn className="mt-3" tone="wax" onClick={nachWurf}>Weiter</Btn>
              </>
            ) : (
              <Btn className="mt-3" tone="wax" onClick={wuerfle}>Würfeln</Btn>
            )}
          </div>
        )}
      </div>
      <aside className="scroll-thin grid content-start gap-3 overflow-auto">
        <section className="rounded-2xl border border-line bg-surface p-3">
          <h3 className="font-display text-xl">Auftrag</h3>
          {quests.length === 0 && <p className="mt-2 text-sm text-muted">Noch kein Auftrag. Die Wirtin im Hirsch weiß mehr.</p>}
          {quests.map((quest) => (
            <article key={quest.id} className="mt-3">
              <p className="text-sm text-fg">{quest.name}</p>
              <p className="text-xs text-muted">{spiel.questStatus[quest.id] === "abgeschlossen" ? "abgeschlossen" : "aktiv"}</p>
              <ul className="mt-2 grid gap-1 text-sm">
                {quest.tasks.map((task) => {
                  const fertig = spiel.taskErledigt[`${quest.id}:${task.id}`];
                  return <li key={task.id} className={fertig ? "text-fg" : "text-muted"}>{fertig ? "✓" : "·"} {task.beschreibung}</li>;
                })}
              </ul>
            </article>
          ))}
        </section>
        <section className="rounded-2xl border border-line bg-surface p-3">
          <h3 className="font-display text-xl">Beutel</h3>
          {spiel.items.length === 0 && <p className="mt-2 text-sm text-muted">Leer.</p>}
          <ul className="mt-2 grid gap-2">
            {spiel.items.map((id) => {
              const gegenstand = projekt.gegenstaende.find((eintrag) => eintrag.id === id);
              const bild = projekt.assets.find((asset) => asset.id === gegenstand?.assetId)?.pfad;
              return (
                <li key={id} className="flex items-center gap-2 text-sm">
                  {bild && <img src={bild} alt="" className="size-10 rounded-lg object-cover" />}
                  {gegenstand?.name ?? id}
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-3">
          <h3 className="font-display text-xl">Speicher</h3>
          <div className="mt-2 grid gap-2">
            {slots.map((slot, index) => (
              <div key={slot?.id ?? `leer-${index}`} className="rounded-xl border border-line p-2">
                <p className="text-sm">{slot ? `${slot.name} · ${new Date(slot.aktualisiert).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : `Stand ${index + 1}`}</p>
                <div className="mt-2 flex gap-2">
                  <Btn onClick={() => speichernIn(index)}>{slot ? "Überschreiben" : "Speichern"}</Btn>
                  {slot && <Btn onClick={() => laden(index)}>Laden</Btn>}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-line p-3">
          <h3 className="font-display text-xl">Protokoll</h3>
          <ul className="mt-2 grid gap-1 text-sm text-muted">
            {spiel.log.slice(-4).map((zeile, index) => <li key={`${index}-${zeile}`}>{zeile}</li>)}
          </ul>
        </section>
      </aside>
    </div>
  );
}
