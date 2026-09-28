import type { PointerEvent as ReactPointerEvent } from "react";
import type { Projekt, SzenenObjekt } from "@/lib/types";
import { klemme } from "@/spiel/engine/scene";
import { portraitPfad } from "@/spiel/engine/npc";

export function SzenenCanvas({
  pfad,
  projekt,
  objekte,
  modus,
  aktivId,
  onSelect,
  onMove,
  onActivate,
}: {
  pfad?: string;
  projekt: Projekt;
  objekte: SzenenObjekt[];
  modus: "editor" | "spiel";
  aktivId?: string;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onActivate?: (id: string) => void;
}) {
  function bild(objekt: SzenenObjekt): string | undefined {
    if (objekt.typ === "npc" && objekt.referenzId) {
      const npc = projekt.npcs.find((eintrag) => eintrag.id === objekt.referenzId);
      return npc ? portraitPfad(projekt, npc) : undefined;
    }
    if (objekt.typ === "item" && objekt.referenzId) {
      const gegenstand = projekt.gegenstaende.find((eintrag) => eintrag.id === objekt.referenzId);
      return projekt.assets.find((asset) => asset.id === gegenstand?.assetId)?.pfad;
    }
    return undefined;
  }

  function ziehe(event: ReactPointerEvent<HTMLButtonElement>, objekt: SzenenObjekt) {
    if (modus !== "editor" || !onMove) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(objekt.id);
    const flaeche = event.currentTarget.parentElement;
    if (!flaeche) return;
    const rect = flaeche.getBoundingClientRect();
    const ziel = event.currentTarget;
    ziel.setPointerCapture(event.pointerId);
    const bewegen = (ev: PointerEvent) => {
      const x = klemme(((ev.clientX - rect.left) / rect.width) * 100 - objekt.w / 2, 0, 100 - objekt.w);
      const y = klemme(((ev.clientY - rect.top) / rect.height) * 100 - objekt.h / 2, 0, 100 - objekt.h);
      onMove(objekt.id, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
    };
    const los = () => {
      ziel.removeEventListener("pointermove", bewegen);
      ziel.removeEventListener("pointerup", los);
    };
    ziel.addEventListener("pointermove", bewegen);
    ziel.addEventListener("pointerup", los);
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink touch-none">
      <div className="buehne-fallback absolute inset-0" />
      {pfad && <img src={pfad} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {objekte.map((objekt) => {
        const gesicht = bild(objekt);
        const aktiv = aktivId === objekt.id;
        return (
          <button
            key={objekt.id}
            type="button"
            aria-label={objekt.name}
            onPointerDown={(event) => ziehe(event, objekt)}
            onClick={(event) => {
              event.stopPropagation();
              if (modus === "spiel") onActivate?.(objekt.id);
              else onSelect?.(objekt.id);
            }}
            className={`absolute flex min-h-11 min-w-11 flex-col items-center justify-end gap-1 rounded-xl border px-1 pb-1 text-paper ${aktiv ? "border-wax bg-ink/60" : "border-paper/40 bg-ink/40"}`}
            style={{ left: `${objekt.x}%`, top: `${objekt.y}%`, width: `${objekt.w}%`, height: `${objekt.h}%` }}
          >
            {gesicht && <img src={gesicht} alt="" className="size-8 rounded-full border border-paper object-cover" />}
            <span className="max-w-full truncate rounded-full bg-ink/80 px-2 py-0.5 text-xs">{objekt.name}</span>
          </button>
        );
      })}
    </div>
  );
}
