import type { Variable } from "@/lib/types";
import { neueId, ohneVariable } from "@/lib/refs";
import { Btn, Feld } from "@/werkzeug/editor/ui/panels/felder";
import { useEditor } from "@/werkzeug/editor/state";

export function VariablenEditor() {
  const projekt = useEditor((s) => s.projekt);
  const update = useEditor((s) => s.update);

  function setze(id: string, fn: (variable: Variable) => Variable) {
    update((p) => ({ ...p, variablen: p.variablen.map((variable) => (variable.id === id ? fn(variable) : variable)) }));
  }

  return (
    <div className="grid gap-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl">Variablen</h2>
          <p className="text-sm text-muted">Flags und Werte. Im Text als {"{name}"}.</p>
        </div>
        <Btn
          tone="wax"
          onClick={() =>
            update((p) => ({
              ...p,
              variablen: [...p.variablen, { id: neueId("v"), name: "flag", typ: "bool", standard: false, beschreibung: "" }],
            }))
          }
        >
          Variable
        </Btn>
      </div>
      <div className="grid gap-3">
        {projekt.variablen.map((variable) => (
          <article key={variable.id} className="grid gap-3 rounded-2xl border border-line bg-surface p-3 md:grid-cols-4">
            <Feld label="Name">
              <input value={variable.name} onChange={(event) => setze(variable.id, (eintrag) => ({ ...eintrag, name: event.target.value.replace(/\s+/g, "_") }))} />
            </Feld>
            <Feld label="Typ">
              <select
                value={variable.typ}
                onChange={(event) => {
                  const typ = event.target.value as Variable["typ"];
                  const standard = typ === "bool" ? false : typ === "number" ? 0 : "";
                  setze(variable.id, (eintrag) => ({ ...eintrag, typ, standard }));
                }}
              >
                <option value="bool">bool</option>
                <option value="number">number</option>
                <option value="string">string</option>
              </select>
            </Feld>
            <Feld label="Standard">
              {variable.typ === "bool" ? (
                <select value={String(variable.standard)} onChange={(event) => setze(variable.id, (eintrag) => ({ ...eintrag, standard: event.target.value === "true" }))}>
                  <option value="true">ja</option>
                  <option value="false">nein</option>
                </select>
              ) : (
                <input
                  value={String(variable.standard)}
                  onChange={(event) =>
                    setze(variable.id, (eintrag) => ({
                      ...eintrag,
                      standard: variable.typ === "number" ? Number(event.target.value) : event.target.value,
                    }))
                  }
                />
              )}
            </Feld>
            <Feld label="Beschreibung">
              <input value={variable.beschreibung} onChange={(event) => setze(variable.id, (eintrag) => ({ ...eintrag, beschreibung: event.target.value }))} />
            </Feld>
            <Btn onClick={() => update((p) => ohneVariable(p, variable.id))}>Löschen</Btn>
          </article>
        ))}
      </div>
    </div>
  );
}
