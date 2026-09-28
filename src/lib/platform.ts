/**
 * Plattform-Adapter.
 * Web nutzt Datei-Input und den Browser-Zurück-Stapel.
 * Liegt window.Capacitor vor (Android-Hülle), erkennt die Laufzeit das —
 * Galerie und Dateisystem können dort denselben Adapter ersetzen,
 * ohne eine zweite Engine zu bauen. Diese Vorschau bleibt die Web-Laufzeit.
 */
export function laufzeit(): "web" | "android" {
  if (typeof window !== "undefined" && "Capacitor" in window) return "android";
  return "web";
}

export function bildAusDatei(datei: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!datei.type.startsWith("image/")) {
      reject(new Error("Nur Bilder."));
      return;
    }
    if (datei.size > 1_200_000) {
      reject(new Error("Bilder bis 1,2 MB."));
      return;
    }
    const leser = new FileReader();
    leser.onload = () => resolve(String(leser.result));
    leser.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    leser.readAsDataURL(datei);
  });
}

/** true = Zurück wurde verbraucht und der Sentinel bleibt. */
export function bindZurueck(handler: () => boolean): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.history.pushState({ bys: 1 }, "");
  const onPop = () => {
    const verbraucht = handler();
    if (verbraucht) window.history.pushState({ bys: 1 }, "");
  };
  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}
