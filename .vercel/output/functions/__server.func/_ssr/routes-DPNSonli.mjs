import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, c as Dices, i as ScrollText, l as Braces, n as Users, o as Map, s as Images, t as Zap } from "../_libs/lucide-react.mjs";
import { n as createJSONStorage, r as persist, t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DPNSonli.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function lager() {
	if (typeof window === "undefined") return {
		getItem: () => null,
		setItem: () => void 0,
		removeItem: () => void 0,
		clear: () => void 0,
		key: () => null,
		length: 0
	};
	return window.localStorage;
}
var jsonSpeicher = createJSONStorage(lager);
function istProjekt(wert) {
	if (!wert || typeof wert !== "object") return false;
	const projekt = wert;
	return projekt.format === 1 && typeof projekt.name === "string" && typeof projekt.startSzeneId === "string" && Array.isArray(projekt.szenen) && Array.isArray(projekt.npcs) && Array.isArray(projekt.dialoge) && Array.isArray(projekt.quests) && Array.isArray(projekt.ereignisse) && Array.isArray(projekt.proben) && Array.isArray(projekt.assets) && Array.isArray(projekt.variablen) && Array.isArray(projekt.gegenstaende) && Array.isArray(projekt.kapitel);
}
function istSave(wert) {
	if (!wert || typeof wert !== "object") return false;
	const stand = wert;
	return stand.format === 1 && typeof stand.szeneId === "string" && typeof stand.variablen === "object" && stand.variablen !== null && Array.isArray(stand.rueckweg) && Array.isArray(stand.log) && Array.isArray(stand.items);
}
function leseSlots(wert) {
	const leer = [
		null,
		null,
		null
	];
	if (!Array.isArray(wert)) return leer;
	for (let index = 0; index < 3; index += 1) {
		const slot = wert[index];
		if (!slot || typeof slot !== "object") continue;
		const kandidat = slot;
		if (typeof kandidat.id === "string" && typeof kandidat.name === "string" && istSave(kandidat.stand)) leer[index] = kandidat;
	}
	return leer;
}
function projektExport(projekt) {
	const blob = new Blob([JSON.stringify(projekt, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${projekt.name.toLowerCase().replace(/\s+/g, "-")}.json`;
	link.click();
	URL.revokeObjectURL(url);
}
function bildAusDatei(datei) {
	return new Promise((resolve, reject) => {
		if (!datei.type.startsWith("image/")) {
			reject(/* @__PURE__ */ new Error("Nur Bilder."));
			return;
		}
		if (datei.size > 12e5) {
			reject(/* @__PURE__ */ new Error("Bilder bis 1,2 MB."));
			return;
		}
		const leser = new FileReader();
		leser.onload = () => resolve(String(leser.result));
		leser.onerror = () => reject(/* @__PURE__ */ new Error("Bild konnte nicht gelesen werden."));
		leser.readAsDataURL(datei);
	});
}
/** true = Zurück wurde verbraucht und der Sentinel bleibt. */
function bindZurueck(handler) {
	if (typeof window === "undefined") return () => void 0;
	window.history.pushState({ bys: 1 }, "");
	const onPop = () => {
		if (handler()) window.history.pushState({ bys: 1 }, "");
	};
	window.addEventListener("popstate", onPop);
	return () => window.removeEventListener("popstate", onPop);
}
function neueId(prefix) {
	return `${prefix}-${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8)}`;
}
function ohne(ids, id) {
	return ids.filter((eintrag) => eintrag !== id);
}
function bedingungBleibt(bedingung, art, id) {
	if (art === "szene" && bedingung.art === "szene") return bedingung.szeneId !== id;
	if (art === "npc" && bedingung.art === "npc") return bedingung.npcId !== id;
	if (art === "item" && bedingung.art === "item") return bedingung.itemId !== id;
	return true;
}
function questsOhne(projekt, art, id) {
	return projekt.quests.map((quest) => ({
		...quest,
		startSzeneId: art === "szene" && quest.startSzeneId === id ? void 0 : quest.startSzeneId,
		startNpcId: art === "npc" && quest.startNpcId === id ? void 0 : quest.startNpcId,
		abgabeNpcId: art === "npc" && quest.abgabeNpcId === id ? void 0 : quest.abgabeNpcId,
		zielSzeneIds: art === "szene" ? ohne(quest.zielSzeneIds, id) : quest.zielSzeneIds,
		belohnung: {
			...quest.belohnung,
			items: art === "item" ? ohne(quest.belohnung.items, id) : quest.belohnung.items
		},
		startBedingungen: quest.startBedingungen.filter((bedingung) => bedingungBleibt(bedingung, art, id)),
		tasks: quest.tasks.filter((task) => bedingungBleibt(task.bedingung, art, id))
	}));
}
function ohneEreignis(projekt, id) {
	return {
		...projekt,
		ereignisse: projekt.ereignisse.filter((ereignis) => ereignis.id !== id).map((ereignis) => ({
			...ereignis,
			folgeIds: ohne(ereignis.folgeIds, id)
		})),
		proben: projekt.proben.map((probe) => ({
			...probe,
			erfolgEreignisIds: ohne(probe.erfolgEreignisIds, id),
			misserfolgEreignisIds: ohne(probe.misserfolgEreignisIds, id)
		})),
		szenen: projekt.szenen.map((szene) => ({
			...szene,
			beimBetreten: ohne(szene.beimBetreten, id),
			beimVerlassen: ohne(szene.beimVerlassen, id),
			objekte: szene.objekte.map((objekt) => ({
				...objekt,
				ereignisIds: ohne(objekt.ereignisIds, id)
			}))
		})),
		quests: projekt.quests.map((quest) => ({
			...quest,
			tasks: quest.tasks.map((task) => task.ereignisId === id ? {
				...task,
				ereignisId: void 0
			} : task)
		})),
		dialoge: projekt.dialoge.map((dialog) => ({
			...dialog,
			zeilen: dialog.zeilen.map((zeile) => ({
				...zeile,
				choices: zeile.choices.map((choice) => ({
					...choice,
					ereignisIds: ohne(choice.ereignisIds, id)
				}))
			}))
		}))
	};
}
function ohneSzene(projekt, id) {
	const szenen = projekt.szenen.filter((szene) => szene.id !== id);
	return {
		...projekt,
		szenen,
		startSzeneId: projekt.startSzeneId === id ? szenen[0]?.id ?? "" : projekt.startSzeneId,
		ereignisse: projekt.ereignisse.map((ereignis) => ereignis.zielSzeneId === id ? {
			...ereignis,
			zielSzeneId: void 0
		} : ereignis),
		quests: questsOhne(projekt, "szene", id).map((quest) => ({
			...quest,
			startSzeneId: quest.startSzeneId
		}))
	};
}
function ohneNpc(projekt, id) {
	const dialogId = projekt.npcs.find((eintrag) => eintrag.id === id)?.dialogId;
	return {
		...projekt,
		npcs: projekt.npcs.filter((eintrag) => eintrag.id !== id),
		dialoge: dialogId ? projekt.dialoge.filter((dialog) => dialog.id !== dialogId) : projekt.dialoge,
		szenen: projekt.szenen.map((szene) => ({
			...szene,
			objekte: szene.objekte.map((objekt) => objekt.typ === "npc" && objekt.referenzId === id ? {
				...objekt,
				referenzId: void 0
			} : objekt)
		})),
		ereignisse: projekt.ereignisse.map((ereignis) => ({
			...ereignis,
			npcId: ereignis.npcId === id ? void 0 : ereignis.npcId,
			dialogId: ereignis.dialogId === dialogId ? void 0 : ereignis.dialogId
		})),
		quests: questsOhne(projekt, "npc", id)
	};
}
function ohneAsset(projekt, id) {
	return {
		...projekt,
		assets: projekt.assets.filter((asset) => asset.id !== id),
		npcs: projekt.npcs.map((npc) => npc.portraitAssetId === id ? {
			...npc,
			portraitAssetId: void 0
		} : npc),
		gegenstaende: projekt.gegenstaende.map((gegenstand) => gegenstand.assetId === id ? {
			...gegenstand,
			assetId: void 0
		} : gegenstand),
		szenen: projekt.szenen.map((szene) => szene.hintergrundAssetId === id ? {
			...szene,
			hintergrundAssetId: void 0
		} : szene)
	};
}
function ohneProbe(projekt, id) {
	return {
		...projekt,
		proben: projekt.proben.filter((probe) => probe.id !== id),
		ereignisse: projekt.ereignisse.map((ereignis) => ereignis.probeId === id ? {
			...ereignis,
			probeId: void 0
		} : ereignis)
	};
}
function ohneGegenstand(projekt, id) {
	return {
		...questsGegenstaende(projekt, id),
		szenen: projekt.szenen.map((szene) => ({
			...szene,
			objekte: szene.objekte.map((objekt) => objekt.typ === "item" && objekt.referenzId === id ? {
				...objekt,
				referenzId: void 0
			} : objekt)
		}))
	};
}
function questsGegenstaende(projekt, id) {
	return {
		...projekt,
		gegenstaende: projekt.gegenstaende.filter((gegenstand) => gegenstand.id !== id),
		quests: questsOhne(projekt, "item", id)
	};
}
function ohneVariable(projekt, id) {
	return {
		...projekt,
		variablen: projekt.variablen.filter((variable) => variable.id !== id)
	};
}
function bedingungErfuellt(bedingung, spiel, _projekt) {
	if (!bedingung) return true;
	if (bedingung.art === "flag") {
		const hat = spiel.variablen[bedingung.key];
		if (bedingung.op === "eq") return hat === bedingung.wert;
		if (bedingung.op === "neq") return hat !== bedingung.wert;
		const links = Number(hat);
		const rechts = Number(bedingung.wert);
		if (bedingung.op === "gte") return links >= rechts;
		return links <= rechts;
	}
	if (bedingung.art === "item") {
		const hat = spiel.items.includes(bedingung.itemId);
		return bedingung.hat ? hat : !hat;
	}
	if (bedingung.art === "szene") return spiel.besuchteSzenen.includes(bedingung.szeneId);
	return spiel.gesprocheneNpcs.includes(bedingung.npcId);
}
function bedingungText(bedingung, projekt) {
	if (!bedingung) return "immer";
	if (bedingung.art === "flag") return `${bedingung.key} ${bedingung.op} ${String(bedingung.wert)}`;
	if (bedingung.art === "item") {
		const name = projekt.gegenstaende.find((gegenstand) => gegenstand.id === bedingung.itemId)?.name ?? bedingung.itemId;
		return bedingung.hat ? `hat ${name}` : `ohne ${name}`;
	}
	if (bedingung.art === "szene") return `war in ${projekt.szenen.find((szene) => szene.id === bedingung.szeneId)?.name ?? bedingung.szeneId}`;
	return `sprach mit ${projekt.npcs.find((npc) => npc.id === bedingung.npcId)?.name ?? bedingung.npcId}`;
}
function standardBedingung(art, projekt) {
	if (art === "flag") {
		const variable = projekt.variablen.find((eintrag) => eintrag.typ === "bool") ?? projekt.variablen[0];
		const wert = variable?.typ === "number" ? 1 : variable?.typ === "string" ? "" : true;
		return {
			art: "flag",
			key: variable?.name ?? "flag",
			op: "eq",
			wert
		};
	}
	if (art === "item") return {
		art: "item",
		itemId: projekt.gegenstaende[0]?.id ?? "",
		hat: true
	};
	if (art === "szene") return {
		art: "szene",
		szeneId: projekt.szenen[0]?.id ?? ""
	};
	return {
		art: "npc",
		npcId: projekt.npcs[0]?.id ?? ""
	};
}
function neuerStand(projekt) {
	const variablen = {};
	for (const variable of projekt.variablen) variablen[variable.name] = variable.standard;
	const szeneId = projekt.startSzeneId;
	const ort = projekt.szenen.find((szene) => szene.id === szeneId)?.name ?? "der Geschichte";
	return {
		format: 1,
		szeneId,
		variablen,
		questStatus: {},
		taskErledigt: {},
		besuchteSzenen: szeneId ? [szeneId] : [],
		gesprocheneNpcs: [],
		items: [],
		xp: 0,
		log: [`Du stehst in ${ort}.`],
		rueckweg: szeneId ? [szeneId] : []
	};
}
function fortschritt(projekt, spiel) {
	const next = {
		...spiel,
		variablen: { ...spiel.variablen },
		questStatus: { ...spiel.questStatus },
		taskErledigt: { ...spiel.taskErledigt },
		items: [...spiel.items],
		besuchteSzenen: [...spiel.besuchteSzenen],
		gesprocheneNpcs: [...spiel.gesprocheneNpcs],
		log: [...spiel.log],
		rueckweg: [...spiel.rueckweg]
	};
	const folgen = [];
	for (let pass = 0; pass < 4; pass += 1) {
		let geaendert = false;
		for (const quest of projekt.quests) {
			let status = next.questStatus[quest.id] ?? "nicht_gestartet";
			const startOk = quest.startBedingungen.length === 0 || quest.startBedingungen.every((bedingung) => bedingungErfuellt(bedingung, next, projekt));
			if (status === "nicht_gestartet" && startOk) {
				status = "aktiv";
				next.questStatus[quest.id] = "aktiv";
				next.log.push(`Quest begonnen: ${quest.name}`);
				geaendert = true;
			}
			if (status !== "aktiv") continue;
			for (const task of quest.tasks) {
				const key = `${quest.id}:${task.id}`;
				if (next.taskErledigt[key]) continue;
				if (!bedingungErfuellt(task.bedingung, next, projekt)) continue;
				next.taskErledigt[key] = true;
				next.log.push(task.beschreibung);
				if (task.ereignisId) folgen.push(task.ereignisId);
				geaendert = true;
			}
			if (!(quest.tasks.length > 0 && quest.tasks.every((task) => next.taskErledigt[`${quest.id}:${task.id}`]))) continue;
			next.questStatus[quest.id] = "abgeschlossen";
			next.xp += quest.belohnung.xp;
			for (const item of quest.belohnung.items) if (!next.items.includes(item)) next.items.push(item);
			for (const flag of quest.belohnung.flags) next.variablen[flag.key] = flag.wert;
			next.log.push(`Abgeschlossen: ${quest.name} (+${quest.belohnung.xp} XP)`);
			geaendert = true;
		}
		if (!geaendert) break;
	}
	next.log = next.log.slice(-40);
	return {
		spiel: next,
		folgen
	};
}
function Siegel({ className = "size-9" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 40 40",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "20",
				cy: "20",
				r: "18",
				className: "fill-wax"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "20",
				cy: "20",
				r: "13",
				fill: "none",
				className: "stroke-ink",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M15 26V15h6.2a4.2 4.2 0 0 1 0 8.4H15",
				fill: "none",
				className: "stroke-ink",
				strokeWidth: "1.8",
				strokeLinecap: "round"
			})
		]
	});
}
function Btn({ tone = "ghost", className = "", type = "button", ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-wax disabled:opacity-50 ${tone === "wax" ? "bg-wax text-ink hover:brightness-110" : tone === "paper" ? "bg-paper text-ink hover:brightness-105" : "border border-line bg-transparent text-fg hover:bg-raised"} ${className}`,
		...rest
	});
}
function Feld({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1 text-sm text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), children]
	});
}
function Zweispalter({ liste, kinder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: liste
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0",
			children: kinder
		})]
	});
}
function IdHaken({ label, eintraege, gewaehlt, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "scroll-thin max-h-36 overflow-auto rounded-xl border border-line p-2",
			children: [eintraege.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 py-2 text-sm text-muted",
				children: "Nichts angelegt."
			}), eintraege.map((eintrag) => {
				const an = gewaehlt.includes(eintrag.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-sm text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: "size-4 accent-wax",
						checked: an,
						onChange: () => onChange(an ? gewaehlt.filter((id) => id !== eintrag.id) : [...gewaehlt, eintrag.id])
					}), eintrag.name]
				}, eintrag.id);
			})]
		})]
	});
}
function BedingungsForm({ wert, onChange, projekt, optional = false }) {
	const art = wert?.art ?? "immer";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 rounded-xl border border-line bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: bedingungText(wert, projekt)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
				label: "Bedingung",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: art,
					onChange: (event) => {
						const naechste = event.target.value;
						if (naechste === "immer") onChange(void 0);
						else onChange(standardBedingung(naechste, projekt));
					},
					children: [
						optional && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "immer",
							children: "immer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "flag",
							children: "Flag"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "item",
							children: "Gegenstand"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "szene",
							children: "Ort besucht"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "npc",
							children: "NPC gesprochen"
						})
					]
				})
			}),
			wert?.art === "flag" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Variable",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: wert.key,
							onChange: (event) => {
								const variable = projekt.variablen.find((eintrag) => eintrag.name === event.target.value);
								onChange({
									...wert,
									key: event.target.value,
									wert: variable?.standard ?? wert.wert
								});
							},
							children: projekt.variablen.map((variable) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: variable.name,
								children: variable.name
							}, variable.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Vergleich",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: wert.op,
							onChange: (event) => onChange({
								...wert,
								op: event.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "eq",
									children: "gleich"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "neq",
									children: "ungleich"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "gte",
									children: "mindestens"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "lte",
									children: "höchstens"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Wert",
						children: typeof wert.wert === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: String(wert.wert),
							onChange: (event) => onChange({
								...wert,
								wert: event.target.value === "true"
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "true",
								children: "ja"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "false",
								children: "nein"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: String(wert.wert),
							onChange: (event) => {
								const roh = event.target.value;
								const zahl = Number(roh);
								onChange({
									...wert,
									wert: typeof wert.wert === "number" && roh.trim() !== "" && !Number.isNaN(zahl) ? zahl : roh
								});
							}
						})
					})
				]
			}),
			wert?.art === "item" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Gegenstand",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: wert.itemId,
						onChange: (event) => onChange({
							...wert,
							itemId: event.target.value
						}),
						children: projekt.gegenstaende.map((gegenstand) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: gegenstand.id,
							children: gegenstand.name
						}, gegenstand.id))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Besitz",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: wert.hat ? "ja" : "nein",
						onChange: (event) => onChange({
							...wert,
							hat: event.target.value === "ja"
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "ja",
							children: "im Inventar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "nein",
							children: "nicht dabei"
						})]
					})
				})]
			}),
			wert?.art === "szene" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
				label: "Ort",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: wert.szeneId,
					onChange: (event) => onChange({
						...wert,
						szeneId: event.target.value
					}),
					children: projekt.szenen.map((szene) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: szene.id,
						children: szene.name
					}, szene.id))
				})
			}),
			wert?.art === "npc" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
				label: "NPC",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: wert.npcId,
					onChange: (event) => onChange({
						...wert,
						npcId: event.target.value
					}),
					children: projekt.npcs.map((npc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: npc.id,
						children: npc.name
					}, npc.id))
				})
			})
		]
	});
}
function VariablenForm({ paar, onChange, projekt }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [paar.map((eintrag, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[1fr_1fr_auto] gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: eintrag.key,
					onChange: (event) => {
						const variable = projekt.variablen.find((v) => v.name === event.target.value);
						const naechste = [...paar];
						naechste[index] = {
							key: event.target.value,
							wert: variable?.standard ?? eintrag.wert
						};
						onChange(naechste);
					},
					children: projekt.variablen.map((variable) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: variable.name,
						children: variable.name
					}, variable.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: String(eintrag.wert),
					onChange: (event) => {
						const variable = projekt.variablen.find((v) => v.name === eintrag.key);
						const roh = event.target.value;
						let wert = roh;
						if (variable?.typ === "bool") wert = roh === "true" || roh === "ja";
						if (variable?.typ === "number") wert = Number(roh);
						const naechste = [...paar];
						naechste[index] = {
							...eintrag,
							wert
						};
						onChange(naechste);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					tone: "ghost",
					onClick: () => onChange(paar.filter((_, i) => i !== index)),
					"aria-label": "Variable entfernen",
					children: "×"
				})
			]
		}, `${eintrag.key}-${index}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			onClick: () => {
				const variable = projekt.variablen[0];
				if (!variable) return;
				onChange([...paar, {
					key: variable.name,
					wert: variable.standard
				}]);
			},
			children: "Variable setzen"
		})]
	});
}
var assets_default = [
	{
		"id": "a-dorf",
		"name": "Dorfplatz",
		"typ": "hintergrund",
		"quelle": "paket",
		"pfad": "/assets/lindendorf/dorfplatz.jpg",
		"tags": ["ort", "abend"]
	},
	{
		"id": "a-wirt",
		"name": "Zum krummen Hirsch",
		"typ": "hintergrund",
		"quelle": "paket",
		"pfad": "/assets/lindendorf/wirtshaus.jpg",
		"tags": ["ort", "innen"]
	},
	{
		"id": "a-wald",
		"name": "Waldrand",
		"typ": "hintergrund",
		"quelle": "paket",
		"pfad": "/assets/lindendorf/waldrand.jpg",
		"tags": ["ort", "nacht"]
	},
	{
		"id": "a-hilde",
		"name": "Hilde",
		"typ": "portrait",
		"quelle": "paket",
		"pfad": "/assets/lindendorf/hilde.jpg",
		"tags": ["npc", "wirtin"]
	},
	{
		"id": "a-kaspar",
		"name": "Kaspar",
		"typ": "portrait",
		"quelle": "paket",
		"pfad": "/assets/lindendorf/kaspar.jpg",
		"tags": ["npc", "hehler"]
	},
	{
		"id": "a-brief",
		"name": "Versiegelter Brief",
		"typ": "wissen",
		"quelle": "paket",
		"pfad": "/assets/lindendorf/brief.jpg",
		"tags": ["item", "brief"]
	}
];
var szenen_default = {
	startSzeneId: "s-dorf",
	szenen: [
		{
			"id": "s-dorf",
			"name": "Dorfplatz",
			"hintergrundAssetId": "a-dorf",
			"beimBetreten": [],
			"beimVerlassen": [],
			"objekte": [{
				"id": "o-wirt",
				"typ": "trigger",
				"name": "Zum Hirsch",
				"x": 56,
				"y": 40,
				"w": 34,
				"h": 36,
				"ereignisIds": ["ev-zum-wirt"]
			}, {
				"id": "o-gasse",
				"typ": "trigger",
				"name": "Gasse zum Wald",
				"x": 4,
				"y": 32,
				"w": 30,
				"h": 34,
				"ereignisIds": ["ev-zum-wald"]
			}]
		},
		{
			"id": "s-wirt",
			"name": "Zum krummen Hirsch",
			"hintergrundAssetId": "a-wirt",
			"beimBetreten": [],
			"beimVerlassen": [],
			"objekte": [
				{
					"id": "o-hilde",
					"typ": "npc",
					"name": "Hilde",
					"x": 14,
					"y": 36,
					"w": 32,
					"h": 44,
					"referenzId": "n-hilde",
					"ereignisIds": ["ev-hilde"]
				},
				{
					"id": "o-platz",
					"typ": "trigger",
					"name": "Auf den Platz",
					"x": 64,
					"y": 54,
					"w": 30,
					"h": 32,
					"ereignisIds": ["ev-zum-dorf"]
				},
				{
					"id": "o-hinten",
					"typ": "trigger",
					"name": "Hintertür",
					"x": 4,
					"y": 10,
					"w": 28,
					"h": 30,
					"ereignisIds": ["ev-zum-wald"]
				}
			]
		},
		{
			"id": "s-wald",
			"name": "Waldrand",
			"hintergrundAssetId": "a-wald",
			"beimBetreten": [],
			"beimVerlassen": [],
			"objekte": [{
				"id": "o-kaspar",
				"typ": "npc",
				"name": "Kaspar",
				"x": 46,
				"y": 28,
				"w": 32,
				"h": 46,
				"referenzId": "n-kaspar",
				"ereignisIds": ["ev-kaspar"]
			}, {
				"id": "o-zurueck",
				"typ": "trigger",
				"name": "Zurück ins Dorf",
				"x": 4,
				"y": 58,
				"w": 34,
				"h": 30,
				"ereignisIds": ["ev-zum-dorf"]
			}]
		}
	]
};
var npcs_default = {
	npcs: [{
		"id": "n-hilde",
		"name": "Hilde",
		"portraitAssetId": "a-hilde",
		"verhalten": "stationaer",
		"dialogId": "d-hilde"
	}, {
		"id": "n-kaspar",
		"name": "Kaspar",
		"portraitAssetId": "a-kaspar",
		"verhalten": "stationaer",
		"dialogId": "d-kaspar"
	}],
	dialoge: [
		{
			"id": "d-hilde",
			"label": "hilde",
			"zeilen": [
				{
					"id": "z-h1",
					"sprecher": "Hilde",
					"text": "Der Hirsch hat noch einen Tisch frei. Du siehst nicht aus, als wärst du wegen des Eintopfs hier, {name}.",
					"variablen": [],
					"choices": [{
						"id": "c-h-such",
						"text": "Ich suche Kaspar, den Hehler.",
						"naechsteId": "z-h2",
						"ereignisIds": [],
						"variablen": []
					}, {
						"id": "c-h-bett",
						"text": "Nur ein Bett für die Nacht.",
						"naechsteId": "z-h3",
						"ereignisIds": [],
						"variablen": []
					}]
				},
				{
					"id": "z-h2",
					"sprecher": "Hilde",
					"text": "Kaspar handelt nicht auf dem Platz. Hinter der Scheune, wo der Nebel anfängt. Er redet nur mit Leuten, die etwas riskieren. Dein Mut steht bei {mut}.",
					"variablen": [{
						"key": "auftrag",
						"wert": true
					}],
					"choices": [{
						"id": "c-h-geh",
						"text": "Dann gehe ich.",
						"ereignisIds": ["ev-zum-wald"],
						"variablen": []
					}, {
						"id": "c-h-bleib",
						"text": "Ich trinke erst noch etwas.",
						"ereignisIds": [],
						"variablen": []
					}]
				},
				{
					"id": "z-h3",
					"sprecher": "Hilde",
					"text": "Unterm Dach, links. Falls du es dir anders überlegst: der Hehler wartet nicht bis zum Morgen.",
					"variablen": [],
					"choices": [{
						"id": "c-h-doch",
						"text": "Doch. Wo ist Kaspar?",
						"naechsteId": "z-h2",
						"ereignisIds": [],
						"variablen": []
					}]
				}
			]
		},
		{
			"id": "d-kaspar",
			"label": "kaspar",
			"zeilen": [{
				"id": "z-k1",
				"sprecher": "Kaspar",
				"text": "Kaspar mustert dich unter der Kapuze. „Geschäft oder Ärger, {name}?“",
				"variablen": [],
				"choices": [{
					"id": "c-k-stell",
					"text": "Ein Brief, der dir gehört.",
					"ereignisIds": ["ev-probe"],
					"variablen": []
				}, {
					"id": "c-k-weg",
					"text": "Weder noch.",
					"ereignisIds": ["ev-zum-dorf"],
					"variablen": []
				}]
			}]
		},
		{
			"id": "d-sieg",
			"label": "kaspar_sieg",
			"zeilen": [{
				"id": "z-s1",
				"sprecher": "Kaspar",
				"text": "Du hast nicht geblinzelt. Nimm den Brief. Und tu so, als hättest du mein Gesicht nie gesehen.",
				"variablen": [],
				"choices": [{
					"id": "c-s-nimm",
					"text": "Ich nehme ihn.",
					"ereignisIds": [],
					"variablen": []
				}]
			}]
		}
	]
};
var quests_default = {
	kapitel: [{
		"id": "k-prol",
		"name": "Prolog"
	}],
	gegenstaende: [{
		"id": "g-brief",
		"name": "Versiegelter Brief",
		"assetId": "a-brief",
		"beschreibung": "Der Grund, warum du nach Lindendorf kamst."
	}],
	quests: [{
		"id": "q-hehler",
		"kapitelId": "k-prol",
		"name": "Finde den Hehler",
		"beschreibung": "Wirtin Hilde weiß, wo Kaspar handelt. Folge dem Pfad zum Waldrand und stelle ihn.",
		"startBedingungen": [{
			"art": "flag",
			"key": "auftrag",
			"op": "eq",
			"wert": true
		}],
		"tasks": [{
			"id": "t-wald",
			"beschreibung": "Den Waldrand erreichen",
			"bedingung": {
				"art": "szene",
				"szeneId": "s-wald"
			}
		}, {
			"id": "t-kaspar",
			"beschreibung": "Kaspar stellen",
			"bedingung": {
				"art": "flag",
				"key": "gestellt",
				"op": "eq",
				"wert": true
			}
		}],
		"belohnung": {
			"items": ["g-brief"],
			"flags": [],
			"xp": 25
		},
		"startSzeneId": "s-dorf",
		"zielSzeneIds": ["s-wald"],
		"startNpcId": "n-hilde",
		"abgabeNpcId": "n-kaspar"
	}]
};
var roh = {
	format: 1,
	id: "lindendorf",
	name: "Lindendorf",
	startSzeneId: szenen_default.startSzeneId,
	kapitel: quests_default.kapitel,
	assets: assets_default,
	variablen: [
		{
			"id": "v-name",
			"name": "name",
			"typ": "string",
			"standard": "Fremde",
			"beschreibung": "Wie die Geschichte dich anspricht."
		},
		{
			"id": "v-mut",
			"name": "mut",
			"typ": "number",
			"standard": 4,
			"beschreibung": "Eigenschaft für Proben. Erfolg, wenn W10 + Wert ≥ Schwierigkeit."
		},
		{
			"id": "v-auftrag",
			"name": "auftrag",
			"typ": "bool",
			"standard": false,
			"beschreibung": "Hilde hat den Pfad zum Hehler genannt."
		},
		{
			"id": "v-gestellt",
			"name": "gestellt",
			"typ": "bool",
			"standard": false,
			"beschreibung": "Kaspar wurde gestellt."
		}
	],
	gegenstaende: quests_default.gegenstaende,
	szenen: szenen_default.szenen,
	npcs: npcs_default.npcs,
	dialoge: npcs_default.dialoge,
	quests: quests_default.quests,
	ereignisse: [
		{
			"id": "ev-zum-wirt",
			"name": "Zum Hirsch",
			"typ": "szene_wechsel",
			"zielSzeneId": "s-wirt",
			"folgeIds": []
		},
		{
			"id": "ev-zum-dorf",
			"name": "Zurück auf den Platz",
			"typ": "szene_wechsel",
			"zielSzeneId": "s-dorf",
			"folgeIds": []
		},
		{
			"id": "ev-zum-wald",
			"name": "Zum Waldrand",
			"typ": "szene_wechsel",
			"zielSzeneId": "s-wald",
			"folgeIds": []
		},
		{
			"id": "ev-hilde",
			"name": "Gespräch mit Hilde",
			"typ": "dialog",
			"npcId": "n-hilde",
			"dialogId": "d-hilde",
			"folgeIds": []
		},
		{
			"id": "ev-kaspar",
			"name": "Gespräch mit Kaspar",
			"typ": "dialog",
			"npcId": "n-kaspar",
			"dialogId": "d-kaspar",
			"folgeIds": []
		},
		{
			"id": "ev-probe",
			"name": "Kaspar stellen",
			"typ": "wuerfel",
			"probeId": "p-mut",
			"folgeIds": []
		},
		{
			"id": "ev-gestellt",
			"name": "Kaspar gestellt",
			"typ": "flag_set",
			"flagKey": "gestellt",
			"flagWert": true,
			"folgeIds": ["ev-sieg"]
		},
		{
			"id": "ev-sieg",
			"name": "Kaspar gibt nach",
			"typ": "dialog",
			"npcId": "n-kaspar",
			"dialogId": "d-sieg",
			"folgeIds": []
		},
		{
			"id": "ev-flucht",
			"name": "Kaspar weicht aus",
			"typ": "custom",
			"notiz": "Kaspar weicht aus und verschwindet zwischen den Birken. Du kannst es noch einmal versuchen.",
			"folgeIds": []
		}
	],
	proben: [{
		"id": "p-mut",
		"name": "Kaspar stellen",
		"eigenschaft": "mut",
		"schwierigkeit": 8,
		"erfolgEreignisIds": ["ev-gestellt"],
		"misserfolgEreignisIds": ["ev-flucht"]
	}]
};
if (!istProjekt(roh)) throw new Error("Lindendorf-Paket ist ungültig.");
var lindendorf = roh;
function paketKlon() {
	return structuredClone(lindendorf);
}
function textMitWerten(text, spiel) {
	return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
		const wert = spiel.variablen[key];
		return wert === void 0 ? `{${key}}` : String(wert);
	});
}
function setzeVariablen(spiel, paar) {
	if (paar.length === 0) return spiel;
	const variablen = { ...spiel.variablen };
	for (const eintrag of paar) variablen[eintrag.key] = eintrag.wert;
	return {
		...spiel,
		variablen
	};
}
function sichtbareChoices(zeile, spiel, projekt) {
	return zeile.choices.filter((choice) => !choice.bedingung || bedingungErfuellt(choice.bedingung, spiel, projekt));
}
function alsSkript(dialog) {
	const zeilen = [`=== ${dialog.label} ===`];
	for (const zeile of dialog.zeilen) {
		zeilen.push(`${zeile.sprecher}: ${zeile.text}`);
		for (const choice of zeile.choices) zeilen.push(`* [${choice.text}]${choice.naechsteId ? ` -> ${choice.naechsteId}` : ""}`);
		zeilen.push("");
	}
	return zeilen.join("\n");
}
function auswerten(probe, spiel, wurf = 1 + Math.floor(Math.random() * 10)) {
	const stat = Number(spiel.variablen[probe.eigenschaft] ?? 0);
	const summe = wurf + (Number.isFinite(stat) ? stat : 0);
	return {
		wurf,
		summe,
		erfolg: summe >= probe.schwierigkeit,
		stat: Number.isFinite(stat) ? stat : 0
	};
}
function logge(spiel, zeile) {
	return {
		...spiel,
		log: [...spiel.log, zeile].slice(-40)
	};
}
function wende(projekt, lauf, ereignis) {
	if (ereignis.typ === "dialog") {
		const dialog = projekt.dialoge.find((eintrag) => eintrag.id === ereignis.dialogId);
		const zeile = dialog?.zeilen[0];
		let spiel = lauf.spiel;
		if (ereignis.npcId && !spiel.gesprocheneNpcs.includes(ereignis.npcId)) spiel = {
			...spiel,
			gesprocheneNpcs: [...spiel.gesprocheneNpcs, ereignis.npcId]
		};
		if (zeile) spiel = setzeVariablen(spiel, zeile.variablen);
		const fort = fortschritt(projekt, spiel);
		if (!dialog || !zeile) return {
			...lauf,
			spiel: fort.spiel,
			schlange: [
				...lauf.schlange,
				...ereignis.folgeIds,
				...fort.folgen
			]
		};
		return {
			spiel: fort.spiel,
			modal: {
				art: "dialog",
				dialogId: dialog.id,
				zeileId: zeile.id
			},
			schlange: lauf.schlange,
			danach: [
				...lauf.danach,
				...ereignis.folgeIds,
				...fort.folgen
			]
		};
	}
	if (ereignis.typ === "wuerfel") return {
		...lauf,
		modal: {
			art: "wuerfel",
			probeId: ereignis.probeId ?? "",
			fertig: false
		}
	};
	if (ereignis.typ === "szene_wechsel" && ereignis.zielSzeneId) {
		const ziel = projekt.szenen.find((szene) => szene.id === ereignis.zielSzeneId);
		if (!ziel) return lauf;
		const alt = projekt.szenen.find((szene) => szene.id === lauf.spiel.szeneId);
		const besucht = lauf.spiel.besuchteSzenen.includes(ziel.id) ? lauf.spiel.besuchteSzenen : [...lauf.spiel.besuchteSzenen, ziel.id];
		const rueckweg = lauf.spiel.rueckweg[lauf.spiel.rueckweg.length - 1] === ziel.id ? lauf.spiel.rueckweg : [...lauf.spiel.rueckweg, ziel.id].slice(-24);
		const fort = fortschritt(projekt, {
			...lauf.spiel,
			szeneId: ziel.id,
			besuchteSzenen: besucht,
			rueckweg
		});
		return {
			...lauf,
			spiel: fort.spiel,
			schlange: [
				...alt?.beimVerlassen ?? [],
				...ziel.beimBetreten,
				...ereignis.folgeIds,
				...fort.folgen,
				...lauf.schlange
			]
		};
	}
	if (ereignis.typ === "flag_set" && ereignis.flagKey) {
		const fort = fortschritt(projekt, setzeVariablen(lauf.spiel, [{
			key: ereignis.flagKey,
			wert: ereignis.flagWert ?? true
		}]));
		return {
			...lauf,
			spiel: fort.spiel,
			schlange: [
				...ereignis.folgeIds,
				...fort.folgen,
				...lauf.schlange
			]
		};
	}
	const fort = fortschritt(projekt, ereignis.notiz ? logge(lauf.spiel, ereignis.notiz) : lauf.spiel);
	return {
		...lauf,
		spiel: fort.spiel,
		schlange: [
			...ereignis.folgeIds,
			...fort.folgen,
			...lauf.schlange
		]
	};
}
function pumpe(projekt, lauf) {
	let aktuell = lauf;
	for (let schritt = 0; schritt < 48; schritt += 1) {
		if (aktuell.modal || aktuell.schlange.length === 0) return aktuell;
		const id = aktuell.schlange[0];
		if (!id) return aktuell;
		const ereignis = projekt.ereignisse.find((eintrag) => eintrag.id === id);
		aktuell = {
			...aktuell,
			schlange: aktuell.schlange.slice(1)
		};
		if (!ereignis) continue;
		aktuell = wende(projekt, aktuell, ereignis);
	}
	return aktuell;
}
function starte(projekt) {
	const fort = fortschritt(projekt, neuerStand(projekt));
	const szene = projekt.szenen.find((eintrag) => eintrag.id === fort.spiel.szeneId);
	return pumpe(projekt, {
		spiel: fort.spiel,
		modal: null,
		danach: [],
		schlange: [...szene?.beimBetreten ?? [], ...fort.folgen]
	});
}
function klick(projekt, lauf, objektId) {
	if (lauf.modal) return lauf;
	const objekt = projekt.szenen.find((eintrag) => eintrag.id === lauf.spiel.szeneId)?.objekte.find((eintrag) => eintrag.id === objektId);
	if (!objekt) return lauf;
	return pumpe(projekt, {
		...lauf,
		schlange: [...lauf.schlange, ...objekt.ereignisIds]
	});
}
function waehle(projekt, lauf, choiceId) {
	const modal = lauf.modal;
	if (!modal || modal.art !== "dialog") return lauf;
	const dialog = projekt.dialoge.find((eintrag) => eintrag.id === modal.dialogId);
	const zeile = dialog?.zeilen.find((eintrag) => eintrag.id === modal.zeileId);
	const choice = zeile?.choices.find((eintrag) => eintrag.id === choiceId);
	if (!dialog || !zeile || !choice) return lauf;
	let spiel = setzeVariablen(lauf.spiel, choice.variablen);
	const naechste = choice.naechsteId ? dialog.zeilen.find((eintrag) => eintrag.id === choice.naechsteId) : void 0;
	if (naechste) {
		spiel = setzeVariablen(spiel, naechste.variablen);
		const fort = fortschritt(projekt, spiel);
		return {
			spiel: fort.spiel,
			modal: {
				art: "dialog",
				dialogId: dialog.id,
				zeileId: naechste.id
			},
			schlange: lauf.schlange,
			danach: [
				...lauf.danach,
				...choice.ereignisIds,
				...fort.folgen
			]
		};
	}
	const fort = fortschritt(projekt, spiel);
	return pumpe(projekt, {
		spiel: fort.spiel,
		modal: null,
		danach: [],
		schlange: [
			...choice.ereignisIds,
			...lauf.danach,
			...fort.folgen,
			...lauf.schlange
		]
	});
}
function weiter(projekt, lauf) {
	const modal = lauf.modal;
	if (!modal || modal.art !== "dialog") return lauf;
	const dialog = projekt.dialoge.find((eintrag) => eintrag.id === modal.dialogId);
	if (!dialog) return lauf;
	const index = dialog.zeilen.findIndex((zeile) => zeile.id === modal.zeileId);
	const naechste = dialog.zeilen[index + 1];
	if (naechste) {
		const fort = fortschritt(projekt, setzeVariablen(lauf.spiel, naechste.variablen));
		return {
			spiel: fort.spiel,
			modal: {
				art: "dialog",
				dialogId: dialog.id,
				zeileId: naechste.id
			},
			schlange: lauf.schlange,
			danach: [...lauf.danach, ...fort.folgen]
		};
	}
	return pumpe(projekt, {
		spiel: lauf.spiel,
		modal: null,
		danach: [],
		schlange: [...lauf.danach, ...lauf.schlange]
	});
}
function wuerfle(projekt, lauf) {
	const modal = lauf.modal;
	if (!modal || modal.art !== "wuerfel" || modal.fertig) return lauf;
	const probe = projekt.proben.find((eintrag) => eintrag.id === modal.probeId);
	if (!probe) return {
		...lauf,
		modal: {
			...modal,
			wurf: 0,
			summe: 0,
			erfolg: false,
			fertig: true
		}
	};
	const ergebnis = auswerten(probe, lauf.spiel);
	return {
		...lauf,
		modal: {
			art: "wuerfel",
			probeId: modal.probeId,
			wurf: ergebnis.wurf,
			summe: ergebnis.summe,
			erfolg: ergebnis.erfolg,
			fertig: true
		}
	};
}
function nachWurf(projekt, lauf) {
	const modal = lauf.modal;
	if (!modal || modal.art !== "wuerfel" || !modal.fertig) return lauf;
	const probe = projekt.proben.find((eintrag) => eintrag.id === modal.probeId);
	const ids = modal.erfolg ? probe?.erfolgEreignisIds ?? [] : probe?.misserfolgEreignisIds ?? [];
	const zeile = probe ? `${probe.name}: ${modal.wurf} + ${probe.eigenschaft} = ${modal.summe} (${modal.erfolg ? "gelungen" : "misslungen"})` : "Die Probe fehlt.";
	return pumpe(projekt, {
		spiel: logge(lauf.spiel, zeile),
		modal: null,
		danach: [],
		schlange: [...ids, ...lauf.schlange]
	});
}
function abbrechen(lauf) {
	if (!lauf.modal) return lauf;
	return {
		...lauf,
		modal: null,
		danach: []
	};
}
function szeneZurueck(projekt, lauf) {
	const weg = lauf.spiel.rueckweg;
	if (weg.length < 2) return null;
	const zielId = weg[weg.length - 2];
	if (!zielId) return null;
	const ziel = projekt.szenen.find((szene) => szene.id === zielId);
	if (!ziel) return null;
	const fort = fortschritt(projekt, {
		...lauf.spiel,
		szeneId: ziel.id,
		rueckweg: weg.slice(0, -1)
	});
	return pumpe(projekt, {
		spiel: fort.spiel,
		modal: null,
		danach: [],
		schlange: [...ziel.beimBetreten, ...fort.folgen]
	});
}
var anfang = paketKlon();
var start = starte(anfang);
function laufAus(stand) {
	return {
		spiel: stand.spiel,
		modal: stand.modal,
		schlange: stand.schlange,
		danach: stand.danach
	};
}
function ausLauf(lauf) {
	return {
		spiel: lauf.spiel,
		modal: lauf.modal,
		schlange: lauf.schlange,
		danach: lauf.danach
	};
}
var useEditor = create()(persist((set, get) => ({
	projekt: anfang,
	spiel: start.spiel,
	slots: [
		null,
		null,
		null
	],
	modal: null,
	schlange: [],
	danach: [],
	tab: "szenen",
	setTab: (tab) => set({ tab }),
	update: (fn) => set((stand) => ({ projekt: fn(stand.projekt) })),
	beispiel: () => {
		const projekt = paketKlon();
		set({
			projekt,
			...ausLauf(starte(projekt)),
			slots: [
				null,
				null,
				null
			],
			tab: "szenen"
		});
	},
	importieren: (projekt) => set({
		projekt,
		...ausLauf(starte(projekt)),
		slots: [
			null,
			null,
			null
		]
	}),
	neuesSpiel: () => set(ausLauf(starte(get().projekt))),
	speichernIn: (index) => {
		const slots = [...get().slots];
		while (slots.length < 3) slots.push(null);
		slots[index] = {
			id: slots[index]?.id ?? neueId("save"),
			name: `Stand ${index + 1}`,
			aktualisiert: Date.now(),
			stand: structuredClone(get().spiel)
		};
		set({ slots: slots.slice(0, 3) });
	},
	laden: (index) => {
		const slot = get().slots[index];
		if (!slot) return;
		set({
			spiel: structuredClone(slot.stand),
			modal: null,
			schlange: [],
			danach: []
		});
	},
	klick: (objektId) => set(ausLauf(klick(get().projekt, laufAus(get()), objektId))),
	wahl: (choiceId) => set(ausLauf(waehle(get().projekt, laufAus(get()), choiceId))),
	weiter: () => set(ausLauf(weiter(get().projekt, laufAus(get())))),
	wuerfle: () => set(ausLauf(wuerfle(get().projekt, laufAus(get())))),
	nachWurf: () => set(ausLauf(nachWurf(get().projekt, laufAus(get())))),
	zurueckTaste: () => {
		const stand = get();
		if (stand.modal?.art === "wuerfel" && stand.modal.fertig) {
			set(ausLauf(nachWurf(stand.projekt, laufAus(stand))));
			return true;
		}
		if (stand.modal) {
			set(ausLauf(abbrechen(laufAus(stand))));
			return true;
		}
		const zurueck = szeneZurueck(stand.projekt, laufAus(stand));
		if (!zurueck) return false;
		set(ausLauf(zurueck));
		return true;
	}
}), {
	name: "build-your-story-v1",
	storage: jsonSpeicher,
	skipHydration: true,
	partialize: (stand) => ({
		projekt: stand.projekt,
		spiel: stand.spiel,
		slots: stand.slots
	}),
	merge: (persisted, current) => {
		const daten = persisted;
		if (!daten || !istProjekt(daten.projekt)) return current;
		const spiel = istSave(daten.spiel) ? daten.spiel : neuerStand(daten.projekt);
		return {
			...current,
			projekt: daten.projekt,
			spiel,
			slots: leseSlots(daten.slots),
			modal: null,
			schlange: [],
			danach: []
		};
	}
}));
var TYPEN$1 = [
	"alle",
	"hintergrund",
	"portrait",
	"wissen",
	"sonstiges"
];
function AssetBrowser() {
	const projekt = useEditor((s) => s.projekt);
	const update = useEditor((s) => s.update);
	const [suche, setSuche] = (0, import_react.useState)("");
	const [typ, setTyp] = (0, import_react.useState)("alle");
	const [wahl, setWahl] = (0, import_react.useState)(projekt.assets[0]?.id ?? "");
	const [hinweis, setHinweis] = (0, import_react.useState)("");
	const q = suche.trim().toLowerCase();
	const liste = projekt.assets.filter((asset) => {
		if (typ !== "alle" && asset.typ !== typ) return false;
		if (!q) return true;
		return asset.name.toLowerCase().includes(q) || asset.tags.some((tag) => tag.toLowerCase().includes(q));
	});
	const asset = projekt.assets.find((eintrag) => eintrag.id === wahl);
	async function uebernehmen(dateien) {
		setHinweis("");
		for (const datei of dateien) try {
			const pfad = await bildAusDatei(datei);
			const id = neueId("a");
			update((p) => ({
				...p,
				assets: [...p.assets, {
					id,
					name: datei.name.replace(/\.[^.]+$/, ""),
					typ: "sonstiges",
					quelle: "lokal",
					pfad,
					tags: []
				}]
			}));
			setWahl(id);
		} catch (fehler) {
			setHinweis(fehler instanceof Error ? fehler.message : "Upload fehlgeschlagen.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed border-line bg-surface p-4",
				onDragOver: (event) => event.preventDefault(),
				onDrop: (event) => {
					event.preventDefault();
					uebernehmen(event.dataTransfer.files);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Assets"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Bilder aus der Galerie oder per Ziehen. Quelle bleibt am Asset hängen."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "ml-auto inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-wax px-4 text-sm font-medium text-ink",
						children: ["Bild wählen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/*",
							className: "sr-only",
							onChange: (event) => {
								if (event.target.files) uebernehmen(event.target.files);
								event.target.value = "";
							}
						})]
					})]
				}), hinweis && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-wax",
					children: hinweis
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "max-w-xs",
					placeholder: "Suchen",
					value: suche,
					onChange: (event) => setSuche(event.target.value),
					"aria-label": "Assets suchen"
				}), TYPEN$1.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTyp(eintrag),
					className: `min-h-11 rounded-full px-3 text-sm ${typ === eintrag ? "bg-wax text-ink" : "border border-line text-muted"}`,
					children: eintrag
				}, eintrag))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zweispalter, {
				liste: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: liste.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setWahl(eintrag.id),
						className: `overflow-hidden rounded-xl border text-left ${wahl === eintrag.id ? "border-wax" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: eintrag.pfad,
							alt: "",
							className: "aspect-video w-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block px-2 py-2 text-sm text-fg",
							children: eintrag.name
						})]
					}, eintrag.id))
				}),
				kinder: asset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: asset.pfad,
							alt: asset.name,
							className: "max-h-64 w-full rounded-2xl object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: asset.name,
								onChange: (event) => update((p) => ({
									...p,
									assets: p.assets.map((eintrag) => eintrag.id === asset.id ? {
										...eintrag,
										name: event.target.value
									} : eintrag)
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Typ",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: asset.typ,
								onChange: (event) => update((p) => ({
									...p,
									assets: p.assets.map((eintrag) => eintrag.id === asset.id ? {
										...eintrag,
										typ: event.target.value
									} : eintrag)
								})),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "hintergrund",
										children: "hintergrund"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "portrait",
										children: "portrait"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "wissen",
										children: "wissen"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "sonstiges",
										children: "sonstiges"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Tags, durch Komma",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: asset.tags.join(", "),
								onChange: (event) => update((p) => ({
									...p,
									assets: p.assets.map((eintrag) => eintrag.id === asset.id ? {
										...eintrag,
										tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)
									} : eintrag)
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: ["Quelle: ", asset.quelle]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => {
								update((p) => ohneAsset(p, asset.id));
								setWahl("");
							},
							children: "Asset löschen"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Kein Asset gewählt."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 border-t border-line pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Gegenstände"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => update((p) => ({
							...p,
							gegenstaende: [...p.gegenstaende, {
								id: neueId("g"),
								name: "Neues Ding",
								beschreibung: "",
								assetId: p.assets[0]?.id
							}]
						})),
						children: "Anlegen"
					})]
				}), projekt.gegenstaende.map((gegenstand) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 rounded-xl border border-line p-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: gegenstand.name,
								onChange: (event) => update((p) => ({
									...p,
									gegenstaende: p.gegenstaende.map((eintrag) => eintrag.id === gegenstand.id ? {
										...eintrag,
										name: event.target.value
									} : eintrag)
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Bild",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: gegenstand.assetId ?? "",
								onChange: (event) => update((p) => ({
									...p,
									gegenstaende: p.gegenstaende.map((eintrag) => eintrag.id === gegenstand.id ? {
										...eintrag,
										assetId: event.target.value || void 0
									} : eintrag)
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "keins"
								}), projekt.assets.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: eintrag.id,
									children: eintrag.name
								}, eintrag.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Beschreibung",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: gegenstand.beschreibung,
								onChange: (event) => update((p) => ({
									...p,
									gegenstaende: p.gegenstaende.map((eintrag) => eintrag.id === gegenstand.id ? {
										...eintrag,
										beschreibung: event.target.value
									} : eintrag)
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => update((p) => ohneGegenstand(p, gegenstand.id)),
							children: "Entfernen"
						})
					]
				}, gegenstand.id))]
			})
		]
	});
}
var TYPEN = [
	"dialog",
	"wuerfel",
	"szene_wechsel",
	"flag_set",
	"custom"
];
function EreignisEditor() {
	const projekt = useEditor((s) => s.projekt);
	const update = useEditor((s) => s.update);
	const [wahl, setWahl] = (0, import_react.useState)(projekt.ereignisse[0]?.id ?? "");
	const ereignis = projekt.ereignisse.find((eintrag) => eintrag.id === wahl) ?? projekt.ereignisse[0];
	function setze(fn) {
		if (!ereignis) return;
		update((p) => ({
			...p,
			ereignisse: p.ereignisse.map((eintrag) => eintrag.id === ereignis.id ? fn(eintrag) : eintrag)
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zweispalter, {
			liste: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				tone: "wax",
				onClick: () => {
					const id = neueId("ev");
					update((p) => ({
						...p,
						ereignisse: [...p.ereignisse, {
							id,
							name: "Neues Ereignis",
							typ: "custom",
							notiz: "",
							folgeIds: []
						}]
					}));
					setWahl(id);
				},
				children: "Ereignis"
			}), projekt.ereignisse.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setWahl(eintrag.id),
				className: `min-h-11 rounded-xl border px-3 text-left text-sm ${ereignis?.id === eintrag.id ? "border-wax text-fg" : "border-line text-muted"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block",
					children: eintrag.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: eintrag.typ
				})]
			}, eintrag.id))] }),
			kinder: ereignis ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full border border-wax px-3 py-1 text-fg",
							children: ereignis.name
						}), ereignis.folgeIds.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full border border-line px-3 py-1",
							children: ["→ ", projekt.ereignisse.find((e) => e.id === id)?.name ?? id]
						}, id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: ereignis.name,
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								name: event.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Typ",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: ereignis.typ,
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								typ: event.target.value
							})),
							children: TYPEN.map((typ) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: typ,
								children: typ
							}, typ))
						})
					}),
					ereignis.typ === "dialog" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "NPC",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: ereignis.npcId ?? "",
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								npcId: event.target.value || void 0
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "keiner"
							}), projekt.npcs.map((npc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: npc.id,
								children: npc.name
							}, npc.id))]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Dialog",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: ereignis.dialogId ?? "",
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								dialogId: event.target.value || void 0
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "keiner"
							}), projekt.dialoge.map((dialog) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: dialog.id,
								children: dialog.label
							}, dialog.id))]
						})
					})] }),
					ereignis.typ === "wuerfel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Probe",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: ereignis.probeId ?? "",
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								probeId: event.target.value || void 0
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "keine"
							}), projekt.proben.map((probe) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: probe.id,
								children: probe.name
							}, probe.id))]
						})
					}),
					ereignis.typ === "szene_wechsel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Zielort",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: ereignis.zielSzeneId ?? "",
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								zielSzeneId: event.target.value || void 0
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "keiner"
							}), projekt.szenen.map((szene) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: szene.id,
								children: szene.name
							}, szene.id))]
						})
					}),
					ereignis.typ === "flag_set" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Variable",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: ereignis.flagKey ?? "",
								onChange: (event) => {
									const variable = projekt.variablen.find((v) => v.name === event.target.value);
									setze((eintrag) => ({
										...eintrag,
										flagKey: event.target.value,
										flagWert: variable?.standard ?? true
									}));
								},
								children: projekt.variablen.map((variable) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: variable.name,
									children: variable.name
								}, variable.id))
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Wert",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: String(ereignis.flagWert ?? ""),
								onChange: (event) => {
									const variable = projekt.variablen.find((v) => v.name === ereignis.flagKey);
									const roh = event.target.value;
									const wert = variable?.typ === "bool" ? roh === "true" || roh === "ja" : variable?.typ === "number" ? Number(roh) : roh;
									setze((eintrag) => ({
										...eintrag,
										flagWert: wert
									}));
								}
							})
						})]
					}),
					ereignis.typ === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Notiz im Protokoll",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: ereignis.notiz ?? "",
							onChange: (event) => setze((eintrag) => ({
								...eintrag,
								notiz: event.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
						label: "Danach",
						eintraege: projekt.ereignisse.filter((e) => e.id !== ereignis.id).map((e) => ({
							id: e.id,
							name: e.name
						})),
						gewaehlt: ereignis.folgeIds,
						onChange: (ids) => setze((eintrag) => ({
							...eintrag,
							folgeIds: ids
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => {
							update((p) => ohneEreignis(p, ereignis.id));
							setWahl("");
						},
						children: "Ereignis löschen"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Noch kein Ereignis."
			})
		})
	});
}
function portraitPfad(projekt, npc) {
	return projekt.assets.find((asset) => asset.id === npc.portraitAssetId)?.pfad;
}
function NpcEditor() {
	const projekt = useEditor((s) => s.projekt);
	const update = useEditor((s) => s.update);
	const [npcId, setNpcId] = (0, import_react.useState)(projekt.npcs[0]?.id ?? "");
	const [skript, setSkript] = (0, import_react.useState)(false);
	const npc = projekt.npcs.find((eintrag) => eintrag.id === npcId) ?? projekt.npcs[0];
	const dialog = projekt.dialoge.find((eintrag) => eintrag.id === npc?.dialogId);
	function setzeDialog(fn) {
		if (!dialog) return;
		update((p) => ({
			...p,
			dialoge: p.dialoge.map((eintrag) => eintrag.id === dialog.id ? fn(eintrag) : eintrag)
		}));
	}
	function setzeZeile(id, fn) {
		setzeDialog((aktuell) => ({
			...aktuell,
			zeilen: aktuell.zeilen.map((zeile) => zeile.id === id ? fn(zeile) : zeile)
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zweispalter, {
			liste: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				tone: "wax",
				onClick: () => {
					const id = neueId("n");
					const dialogId = neueId("d");
					const zeileId = neueId("z");
					update((p) => ({
						...p,
						npcs: [...p.npcs, {
							id,
							name: "Neue Person",
							verhalten: "stationaer",
							dialogId
						}],
						dialoge: [...p.dialoge, {
							id: dialogId,
							label: "neu",
							zeilen: [{
								id: zeileId,
								sprecher: "Neue Person",
								text: "…",
								choices: [],
								variablen: []
							}]
						}]
					}));
					setNpcId(id);
				},
				children: "Person"
			}), projekt.npcs.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setNpcId(eintrag.id),
				className: `flex min-h-11 items-center gap-2 rounded-xl border px-2 text-left text-sm ${npc?.id === eintrag.id ? "border-wax" : "border-line"}`,
				children: [eintrag.portraitAssetId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: projekt.assets.find((a) => a.id === eintrag.portraitAssetId)?.pfad,
					alt: "",
					className: "size-8 rounded-full object-cover"
				}), eintrag.name]
			}, eintrag.id))] }),
			kinder: npc && dialog ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end gap-3",
						children: [
							portraitPfad(projekt, npc) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: portraitPfad(projekt, npc),
								alt: "",
								className: "h-24 w-16 rounded-xl object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
								label: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: npc.name,
									onChange: (event) => {
										const name = event.target.value;
										update((p) => ({
											...p,
											npcs: p.npcs.map((eintrag) => eintrag.id === npc.id ? {
												...eintrag,
												name
											} : eintrag),
											dialoge: p.dialoge.map((eintrag) => eintrag.id !== npc.dialogId ? eintrag : {
												...eintrag,
												zeilen: eintrag.zeilen.map((zeile) => zeile.sprecher === npc.name ? {
													...zeile,
													sprecher: name
												} : zeile)
											})
										}));
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
								label: "Verhalten",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: npc.verhalten,
									onChange: (event) => update((p) => ({
										...p,
										npcs: p.npcs.map((eintrag) => eintrag.id === npc.id ? {
											...eintrag,
											verhalten: event.target.value
										} : eintrag)
									})),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "stationaer",
											children: "stationär"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "patrol",
											children: "patrol"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "custom",
											children: "custom"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
								label: "Portrait",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: npc.portraitAssetId ?? "",
									onChange: (event) => update((p) => ({
										...p,
										npcs: p.npcs.map((eintrag) => eintrag.id === npc.id ? {
											...eintrag,
											portraitAssetId: event.target.value || void 0
										} : eintrag)
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "keins"
									}), projekt.assets.filter((asset) => asset.typ === "portrait" || asset.typ === "sonstiges").map((asset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: asset.id,
										children: asset.name
									}, asset.id))]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
								label: "Label",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: dialog.label,
									onChange: (event) => setzeDialog((eintrag) => ({
										...eintrag,
										label: event.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => setSkript((wert) => !wert),
								children: skript ? "Formular" : "Skript"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => setzeDialog((eintrag) => ({
									...eintrag,
									zeilen: [...eintrag.zeilen, {
										id: neueId("z"),
										sprecher: npc.name,
										text: "…",
										choices: [],
										variablen: []
									}]
								})),
								children: "Zeile"
							})
						]
					}),
					skript ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "whitespace-pre-wrap rounded-2xl bg-paper p-4 text-sm text-ink",
						children: alsSkript(dialog)
					}) : dialog.zeilen.map((zeile, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "grid gap-3 rounded-2xl border border-line bg-surface p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									"Zeile ",
									index + 1,
									" · ",
									zeile.id
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 md:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
									label: "Sprecher",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: zeile.sprecher,
										onChange: (event) => setzeZeile(zeile.id, (eintrag) => ({
											...eintrag,
											sprecher: event.target.value
										}))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
									label: "Text",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: zeile.text,
										onChange: (event) => setzeZeile(zeile.id, (eintrag) => ({
											...eintrag,
											text: event.target.value
										}))
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariablenForm, {
								paar: zeile.variablen,
								projekt,
								onChange: (paar) => setzeZeile(zeile.id, (eintrag) => ({
									...eintrag,
									variablen: paar
								}))
							}),
							zeile.choices.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 rounded-xl border border-line p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
										label: "Antwort",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: choice.text,
											onChange: (event) => setzeZeile(zeile.id, (eintrag) => ({
												...eintrag,
												choices: eintrag.choices.map((alt) => alt.id === choice.id ? {
													...alt,
													text: event.target.value
												} : alt)
											}))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
										label: "Nächste Zeile",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: choice.naechsteId ?? "",
											onChange: (event) => setzeZeile(zeile.id, (eintrag) => ({
												...eintrag,
												choices: eintrag.choices.map((alt) => alt.id === choice.id ? {
													...alt,
													naechsteId: event.target.value || void 0
												} : alt)
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Dialog schließen"
											}), dialog.zeilen.map((ziel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: ziel.id,
												children: [
													ziel.sprecher,
													": ",
													ziel.text.slice(0, 42)
												]
											}, ziel.id))]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedingungsForm, {
										optional: true,
										wert: choice.bedingung,
										projekt,
										onChange: (bedingung) => setzeZeile(zeile.id, (eintrag) => ({
											...eintrag,
											choices: eintrag.choices.map((alt) => alt.id === choice.id ? {
												...alt,
												bedingung
											} : alt)
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
										label: "Ereignisse",
										eintraege: projekt.ereignisse.map((e) => ({
											id: e.id,
											name: e.name
										})),
										gewaehlt: choice.ereignisIds,
										onChange: (ids) => setzeZeile(zeile.id, (eintrag) => ({
											...eintrag,
											choices: eintrag.choices.map((alt) => alt.id === choice.id ? {
												...alt,
												ereignisIds: ids
											} : alt)
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariablenForm, {
										paar: choice.variablen,
										projekt,
										onChange: (paar) => setzeZeile(zeile.id, (eintrag) => ({
											...eintrag,
											choices: eintrag.choices.map((alt) => alt.id === choice.id ? {
												...alt,
												variablen: paar
											} : alt)
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
										onClick: () => setzeZeile(zeile.id, (eintrag) => ({
											...eintrag,
											choices: eintrag.choices.filter((alt) => alt.id !== choice.id)
										})),
										children: "Antwort löschen"
									})
								]
							}, choice.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									onClick: () => setzeZeile(zeile.id, (eintrag) => ({
										...eintrag,
										choices: [...eintrag.choices, {
											id: neueId("c"),
											text: "…",
											ereignisIds: [],
											variablen: []
										}]
									})),
									children: "Antwort"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									onClick: () => setzeDialog((eintrag) => ({
										...eintrag,
										zeilen: eintrag.zeilen.filter((alt) => alt.id !== zeile.id)
									})),
									children: "Zeile löschen"
								})]
							})
						]
					}, zeile.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => {
							update((p) => ohneNpc(p, npc.id));
							setNpcId("");
						},
						children: "Person löschen"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Noch niemand im Ort."
			})
		})
	});
}
function ProbenEditor() {
	const projekt = useEditor((s) => s.projekt);
	const update = useEditor((s) => s.update);
	const [wahl, setWahl] = (0, import_react.useState)(projekt.proben[0]?.id ?? "");
	const probe = projekt.proben.find((eintrag) => eintrag.id === wahl) ?? projekt.proben[0];
	const zahlen = projekt.variablen.filter((variable) => variable.typ === "number");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zweispalter, {
			liste: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				tone: "wax",
				onClick: () => {
					const id = neueId("p");
					update((p) => ({
						...p,
						proben: [...p.proben, {
							id,
							name: "Neue Probe",
							eigenschaft: zahlen[0]?.name ?? "mut",
							schwierigkeit: 6,
							erfolgEreignisIds: [],
							misserfolgEreignisIds: []
						}]
					}));
					setWahl(id);
				},
				children: "Probe"
			}), projekt.proben.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setWahl(eintrag.id),
				className: `min-h-11 rounded-xl border px-3 text-left text-sm ${probe?.id === eintrag.id ? "border-wax text-fg" : "border-line text-muted"}`,
				children: eintrag.name
			}, eintrag.id))] }),
			kinder: probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Würfelprobe"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Erfolg, wenn W10 + Eigenschaft ≥ Schwierigkeit."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: probe.name,
							onChange: (event) => update((p) => ({
								...p,
								proben: p.proben.map((eintrag) => eintrag.id === probe.id ? {
									...eintrag,
									name: event.target.value
								} : eintrag)
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Eigenschaft",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: probe.eigenschaft,
							onChange: (event) => update((p) => ({
								...p,
								proben: p.proben.map((eintrag) => eintrag.id === probe.id ? {
									...eintrag,
									eigenschaft: event.target.value
								} : eintrag)
							})),
							children: [zahlen.map((variable) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: variable.name,
								children: variable.name
							}, variable.id)), zahlen.every((variable) => variable.name !== probe.eigenschaft) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: probe.eigenschaft,
								children: probe.eigenschaft
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: `Schwierigkeit ${probe.schwierigkeit}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 1,
							max: 10,
							value: probe.schwierigkeit,
							onChange: (event) => update((p) => ({
								...p,
								proben: p.proben.map((eintrag) => eintrag.id === probe.id ? {
									...eintrag,
									schwierigkeit: Number(event.target.value)
								} : eintrag)
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
						label: "Bei Erfolg",
						eintraege: projekt.ereignisse.map((e) => ({
							id: e.id,
							name: e.name
						})),
						gewaehlt: probe.erfolgEreignisIds,
						onChange: (ids) => update((p) => ({
							...p,
							proben: p.proben.map((eintrag) => eintrag.id === probe.id ? {
								...eintrag,
								erfolgEreignisIds: ids
							} : eintrag)
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
						label: "Bei Misserfolg",
						eintraege: projekt.ereignisse.map((e) => ({
							id: e.id,
							name: e.name
						})),
						gewaehlt: probe.misserfolgEreignisIds,
						onChange: (ids) => update((p) => ({
							...p,
							proben: p.proben.map((eintrag) => eintrag.id === probe.id ? {
								...eintrag,
								misserfolgEreignisIds: ids
							} : eintrag)
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => {
							update((p) => ohneProbe(p, probe.id));
							setWahl("");
						},
						children: "Probe löschen"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Noch keine Probe."
			})
		})
	});
}
var STATUS = {
	nicht_gestartet: "nicht gestartet",
	aktiv: "aktiv",
	abgeschlossen: "abgeschlossen",
	gescheitert: "gescheitert"
};
function QuestEditor() {
	const projekt = useEditor((s) => s.projekt);
	const spiel = useEditor((s) => s.spiel);
	const update = useEditor((s) => s.update);
	const [kapitelId, setKapitelId] = (0, import_react.useState)(projekt.kapitel[0]?.id ?? "");
	const [questId, setQuestId] = (0, import_react.useState)(projekt.quests[0]?.id ?? "");
	const kapitel = projekt.kapitel.find((eintrag) => eintrag.id === kapitelId) ?? projekt.kapitel[0];
	const quests = projekt.quests.filter((quest) => quest.kapitelId === kapitel?.id);
	const quest = projekt.quests.find((eintrag) => eintrag.id === questId) ?? quests[0];
	function setze(fn) {
		if (!quest) return;
		update((p) => ({
			...p,
			quests: p.quests.map((eintrag) => eintrag.id === quest.id ? fn(eintrag) : eintrag)
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 p-3 lg:grid-cols-[18rem_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-4",
			children: [projekt.kapitel.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "border-l-2 border-wax pl-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 text-left font-display text-xl",
						onClick: () => setKapitelId(eintrag.id),
						children: eintrag.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid gap-1",
						children: projekt.quests.filter((q) => q.kapitelId === eintrag.id).map((q) => {
							const status = spiel.questStatus[q.id] ?? "nicht_gestartet";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setKapitelId(eintrag.id);
									setQuestId(q.id);
								},
								className: `min-h-11 rounded-xl border px-3 text-left text-sm ${quest?.id === q.id ? "border-wax" : "border-line"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-fg",
									children: q.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: STATUS[status]
								})]
							}, q.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						className: "mt-2",
						onClick: () => {
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
									belohnung: {
										items: [],
										flags: [],
										xp: 0
									},
									zielSzeneIds: []
								}]
							}));
							setQuestId(id);
						},
						children: "Quest"
					})
				]
			}, eintrag.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => update((p) => ({
					...p,
					kapitel: [...p.kapitel, {
						id: neueId("k"),
						name: "Neues Kapitel"
					}]
				})),
				children: "Kapitel"
			})]
		}), quest && kapitel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Kapitelname",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: kapitel.name,
						onChange: (event) => update((p) => ({
							...p,
							kapitel: p.kapitel.map((eintrag) => eintrag.id === kapitel.id ? {
								...eintrag,
								name: event.target.value
							} : eintrag)
						}))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Quest",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: quest.name,
						onChange: (event) => setze((eintrag) => ({
							...eintrag,
							name: event.target.value
						}))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Beschreibung",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: quest.beschreibung,
						onChange: (event) => setze((eintrag) => ({
							...eintrag,
							beschreibung: event.target.value
						}))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Start"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => setze((eintrag) => ({
								...eintrag,
								startBedingungen: [...eintrag.startBedingungen, standardBedingung("flag", projekt)]
							})),
							children: "Bedingung"
						})]
					}),
					quest.startBedingungen.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Ohne Bedingung beginnt die Quest mit dem Spiel."
					}),
					quest.startBedingungen.map((bedingung, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedingungsForm, {
							wert: bedingung,
							projekt,
							onChange: (naechste) => setze((eintrag) => ({
								...eintrag,
								startBedingungen: naechste ? eintrag.startBedingungen.map((alt, i) => i === index ? naechste : alt) : eintrag.startBedingungen.filter((_, i) => i !== index)
							})),
							optional: true
						})
					}, `${bedingung.art}-${index}`))
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-l-2 border-line pl-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Schritte"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => setze((eintrag) => ({
								...eintrag,
								tasks: [...eintrag.tasks, {
									id: neueId("t"),
									beschreibung: "Neuer Schritt",
									bedingung: standardBedingung("flag", projekt)
								}]
							})),
							children: "Schritt"
						})]
					}), quest.tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "mb-3 grid gap-2 rounded-xl border border-line p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
								label: "Text",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: task.beschreibung,
									onChange: (event) => setze((eintrag) => ({
										...eintrag,
										tasks: eintrag.tasks.map((alt) => alt.id === task.id ? {
											...alt,
											beschreibung: event.target.value
										} : alt)
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: bedingungText(task.bedingung, projekt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedingungsForm, {
								wert: task.bedingung,
								projekt,
								onChange: (naechste) => {
									if (!naechste) return;
									setze((eintrag) => ({
										...eintrag,
										tasks: eintrag.tasks.map((alt) => alt.id === task.id ? {
											...alt,
											bedingung: naechste
										} : alt)
									}));
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
								label: "Ereignis bei Abschluss",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: task.ereignisId ?? "",
									onChange: (event) => setze((eintrag) => ({
										...eintrag,
										tasks: eintrag.tasks.map((alt) => alt.id === task.id ? {
											...alt,
											ereignisId: event.target.value || void 0
										} : alt)
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "keins"
									}), projekt.ereignisse.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: e.id,
										children: e.name
									}, e.id))]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => setze((eintrag) => ({
									...eintrag,
									tasks: eintrag.tasks.filter((alt) => alt.id !== task.id)
								})),
								children: "Schritt löschen"
							})
						]
					}, task.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "XP",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: quest.belohnung.xp,
								onChange: (event) => setze((eintrag) => ({
									...eintrag,
									belohnung: {
										...eintrag.belohnung,
										xp: Number(event.target.value)
									}
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Startperson",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: quest.startNpcId ?? "",
								onChange: (event) => setze((eintrag) => ({
									...eintrag,
									startNpcId: event.target.value || void 0
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "keine"
								}), projekt.npcs.map((npc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: npc.id,
									children: npc.name
								}, npc.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Abgabe",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: quest.abgabeNpcId ?? "",
								onChange: (event) => setze((eintrag) => ({
									...eintrag,
									abgabeNpcId: event.target.value || void 0
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "keine"
								}), projekt.npcs.map((npc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: npc.id,
									children: npc.name
								}, npc.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Startort",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: quest.startSzeneId ?? "",
								onChange: (event) => setze((eintrag) => ({
									...eintrag,
									startSzeneId: event.target.value || void 0
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "keiner"
								}), projekt.szenen.map((szene) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: szene.id,
									children: szene.name
								}, szene.id))]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
					label: "Zielorte",
					eintraege: projekt.szenen.map((s) => ({
						id: s.id,
						name: s.name
					})),
					gewaehlt: quest.zielSzeneIds,
					onChange: (ids) => setze((eintrag) => ({
						...eintrag,
						zielSzeneIds: ids
					}))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
					label: "Belohnung",
					eintraege: projekt.gegenstaende.map((g) => ({
						id: g.id,
						name: g.name
					})),
					gewaehlt: quest.belohnung.items,
					onChange: (ids) => setze((eintrag) => ({
						...eintrag,
						belohnung: {
							...eintrag.belohnung,
							items: ids
						}
					}))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => {
						update((p) => ({
							...p,
							quests: p.quests.filter((eintrag) => eintrag.id !== quest.id)
						}));
						setQuestId("");
					},
					children: "Quest löschen"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Lege ein Kapitel und eine Quest an."
		})]
	});
}
function hintergrundPfad(projekt, szene) {
	return projekt.assets.find((asset) => asset.id === szene.hintergrundAssetId)?.pfad;
}
function klemme(wert, min, max) {
	return Math.min(max, Math.max(min, wert));
}
function SzenenCanvas({ pfad, projekt, objekte, modus, aktivId, onSelect, onMove, onActivate }) {
	function bild(objekt) {
		if (objekt.typ === "npc" && objekt.referenzId) {
			const npc = projekt.npcs.find((eintrag) => eintrag.id === objekt.referenzId);
			return npc ? portraitPfad(projekt, npc) : void 0;
		}
		if (objekt.typ === "item" && objekt.referenzId) {
			const gegenstand = projekt.gegenstaende.find((eintrag) => eintrag.id === objekt.referenzId);
			return projekt.assets.find((asset) => asset.id === gegenstand?.assetId)?.pfad;
		}
	}
	function ziehe(event, objekt) {
		if (modus !== "editor" || !onMove) return;
		event.preventDefault();
		event.stopPropagation();
		onSelect?.(objekt.id);
		const flaeche = event.currentTarget.parentElement;
		if (!flaeche) return;
		const rect = flaeche.getBoundingClientRect();
		const ziel = event.currentTarget;
		ziel.setPointerCapture(event.pointerId);
		const bewegen = (ev) => {
			const x = klemme((ev.clientX - rect.left) / rect.width * 100 - objekt.w / 2, 0, 100 - objekt.w);
			const y = klemme((ev.clientY - rect.top) / rect.height * 100 - objekt.h / 2, 0, 100 - objekt.h);
			onMove(objekt.id, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
		};
		const los = () => {
			ziel.removeEventListener("pointermove", bewegen);
			ziel.removeEventListener("pointerup", los);
		};
		ziel.addEventListener("pointermove", bewegen);
		ziel.addEventListener("pointerup", los);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink touch-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "buehne-fallback absolute inset-0" }),
			pfad && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: pfad,
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			objekte.map((objekt) => {
				const gesicht = bild(objekt);
				const aktiv = aktivId === objekt.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": objekt.name,
					onPointerDown: (event) => ziehe(event, objekt),
					onClick: (event) => {
						event.stopPropagation();
						if (modus === "spiel") onActivate?.(objekt.id);
						else onSelect?.(objekt.id);
					},
					className: `absolute flex min-h-11 min-w-11 flex-col items-center justify-end gap-1 rounded-xl border px-1 pb-1 text-paper ${aktiv ? "border-wax bg-ink/60" : "border-paper/40 bg-ink/40"}`,
					style: {
						left: `${objekt.x}%`,
						top: `${objekt.y}%`,
						width: `${objekt.w}%`,
						height: `${objekt.h}%`
					},
					children: [gesicht && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: gesicht,
						alt: "",
						className: "size-8 rounded-full border border-paper object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-full truncate rounded-full bg-ink/80 px-2 py-0.5 text-xs",
						children: objekt.name
					})]
				}, objekt.id);
			})
		]
	});
}
function SzenenEditor() {
	const projekt = useEditor((s) => s.projekt);
	const update = useEditor((s) => s.update);
	const [szeneId, setSzeneId] = (0, import_react.useState)(projekt.startSzeneId);
	const [objektId, setObjektId] = (0, import_react.useState)(null);
	const szene = projekt.szenen.find((eintrag) => eintrag.id === szeneId) ?? projekt.szenen[0];
	const objekt = szene?.objekte.find((eintrag) => eintrag.id === objektId);
	if (!szene) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Noch kein Ort."
	});
	function setze(fn) {
		update((p) => ({
			...p,
			szenen: p.szenen.map((eintrag) => eintrag.id === szene?.id ? fn(eintrag) : eintrag)
		}));
	}
	function marker(typ) {
		const id = neueId("o");
		const referenzId = typ === "npc" ? projekt.npcs[0]?.id : typ === "item" ? projekt.gegenstaende[0]?.id : void 0;
		const name = typ === "npc" ? "Person" : typ === "item" ? "Fund" : "Auslöser";
		setze((aktuell) => ({
			...aktuell,
			objekte: [...aktuell.objekte, {
				id,
				typ,
				name,
				x: 30,
				y: 30,
				w: 28,
				h: 32,
				referenzId,
				ereignisIds: []
			}]
		}));
		setObjektId(id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Ort",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: szene.id,
								onChange: (event) => {
									setSzeneId(event.target.value);
									setObjektId(null);
								},
								children: projekt.szenen.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: eintrag.id,
									children: eintrag.name
								}, eintrag.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => {
								const id = neueId("s");
								update((p) => ({
									...p,
									szenen: [...p.szenen, {
										id,
										name: "Neuer Ort",
										beimBetreten: [],
										beimVerlassen: [],
										objekte: []
									}]
								}));
								setSzeneId(id);
							},
							children: "Ort anlegen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => marker("npc"),
							children: "NPC"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => marker("trigger"),
							children: "Auslöser"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => marker("item"),
							children: "Fund"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Marker anfassen und ziehen. Im Test lösen sie Ereignisse aus."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SzenenCanvas, {
					pfad: hintergrundPfad(projekt, szene),
					projekt,
					objekte: szene.objekte,
					modus: "editor",
					aktivId: objektId ?? void 0,
					onSelect: setObjektId,
					onMove: (id, x, y) => setze((aktuell) => ({
						...aktuell,
						objekte: aktuell.objekte.map((eintrag) => eintrag.id === id ? {
							...eintrag,
							x,
							y
						} : eintrag)
					}))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "scroll-thin grid content-start gap-3 overflow-auto rounded-2xl border border-line bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: szene.name,
						onChange: (event) => setze((aktuell) => ({
							...aktuell,
							name: event.target.value
						}))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Hintergrund",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: szene.hintergrundAssetId ?? "",
						onChange: (event) => setze((aktuell) => ({
							...aktuell,
							hintergrundAssetId: event.target.value || void 0
						})),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "keiner"
						}), projekt.assets.filter((asset) => asset.typ === "hintergrund" || asset.typ === "sonstiges").map((asset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: asset.id,
							children: asset.name
						}, asset.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
					label: "Startort der Geschichte",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: projekt.startSzeneId,
						onChange: (event) => update((p) => ({
							...p,
							startSzeneId: event.target.value
						})),
						children: projekt.szenen.map((eintrag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: eintrag.id,
							children: eintrag.name
						}, eintrag.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
					label: "Beim Betreten",
					eintraege: projekt.ereignisse.map((e) => ({
						id: e.id,
						name: e.name
					})),
					gewaehlt: szene.beimBetreten,
					onChange: (ids) => setze((aktuell) => ({
						...aktuell,
						beimBetreten: ids
					}))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
					label: "Beim Verlassen",
					eintraege: projekt.ereignisse.map((e) => ({
						id: e.id,
						name: e.name
					})),
					gewaehlt: szene.beimVerlassen,
					onChange: (ids) => setze((aktuell) => ({
						...aktuell,
						beimVerlassen: ids
					}))
				}),
				objekt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 border-t border-line pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl text-fg",
							children: objekt.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: objekt.name,
								onChange: (event) => setze((aktuell) => ({
									...aktuell,
									objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? {
										...eintrag,
										name: event.target.value
									} : eintrag)
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Art",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: objekt.typ,
								onChange: (event) => setze((aktuell) => ({
									...aktuell,
									objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? {
										...eintrag,
										typ: event.target.value
									} : eintrag)
								})),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "npc",
										children: "NPC"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "trigger",
										children: "Auslöser"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "item",
										children: "Fund"
									})
								]
							})
						}),
						objekt.typ === "npc" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Person",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: objekt.referenzId ?? "",
								onChange: (event) => setze((aktuell) => ({
									...aktuell,
									objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? {
										...eintrag,
										referenzId: event.target.value || void 0
									} : eintrag)
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "keine"
								}), projekt.npcs.map((npc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: npc.id,
									children: npc.name
								}, npc.id))]
							})
						}),
						objekt.typ === "item" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
							label: "Gegenstand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: objekt.referenzId ?? "",
								onChange: (event) => setze((aktuell) => ({
									...aktuell,
									objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? {
										...eintrag,
										referenzId: event.target.value || void 0
									} : eintrag)
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "keiner"
								}), projekt.gegenstaende.map((gegenstand) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: gegenstand.id,
									children: gegenstand.name
								}, gegenstand.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdHaken, {
							label: "Bei Interaktion",
							eintraege: projekt.ereignisse.map((e) => ({
								id: e.id,
								name: e.name
							})),
							gewaehlt: objekt.ereignisIds,
							onChange: (ids) => setze((aktuell) => ({
								...aktuell,
								objekte: aktuell.objekte.map((eintrag) => eintrag.id === objekt.id ? {
									...eintrag,
									ereignisIds: ids
								} : eintrag)
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => {
								setze((aktuell) => ({
									...aktuell,
									objekte: aktuell.objekte.filter((eintrag) => eintrag.id !== objekt.id)
								}));
								setObjektId(null);
							},
							children: "Marker löschen"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => {
						if (projekt.szenen.length < 2) return;
						update((p) => ohneSzene(p, szene.id));
						setSzeneId(projekt.szenen.find((eintrag) => eintrag.id !== szene.id)?.id ?? "");
						setObjektId(null);
					},
					children: "Ort löschen"
				})
			]
		})]
	});
}
function VariablenEditor() {
	const projekt = useEditor((s) => s.projekt);
	const update = useEditor((s) => s.update);
	function setze(id, fn) {
		update((p) => ({
			...p,
			variablen: p.variablen.map((variable) => variable.id === id ? fn(variable) : variable)
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Variablen"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Flags und Werte. Im Text als ",
					"{name}",
					"."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				tone: "wax",
				onClick: () => update((p) => ({
					...p,
					variablen: [...p.variablen, {
						id: neueId("v"),
						name: "flag",
						typ: "bool",
						standard: false,
						beschreibung: ""
					}]
				})),
				children: "Variable"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: projekt.variablen.map((variable) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "grid gap-3 rounded-2xl border border-line bg-surface p-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: variable.name,
							onChange: (event) => setze(variable.id, (eintrag) => ({
								...eintrag,
								name: event.target.value.replace(/\s+/g, "_")
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Typ",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: variable.typ,
							onChange: (event) => {
								const typ = event.target.value;
								const standard = typ === "bool" ? false : typ === "number" ? 0 : "";
								setze(variable.id, (eintrag) => ({
									...eintrag,
									typ,
									standard
								}));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "bool",
									children: "bool"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "number",
									children: "number"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "string",
									children: "string"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Standard",
						children: variable.typ === "bool" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: String(variable.standard),
							onChange: (event) => setze(variable.id, (eintrag) => ({
								...eintrag,
								standard: event.target.value === "true"
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "true",
								children: "ja"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "false",
								children: "nein"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: String(variable.standard),
							onChange: (event) => setze(variable.id, (eintrag) => ({
								...eintrag,
								standard: variable.typ === "number" ? Number(event.target.value) : event.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feld, {
						label: "Beschreibung",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: variable.beschreibung,
							onChange: (event) => setze(variable.id, (eintrag) => ({
								...eintrag,
								beschreibung: event.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => update((p) => ohneVariable(p, variable.id)),
						children: "Löschen"
					})
				]
			}, variable.id))
		})]
	});
}
function SpielerAnsicht() {
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
	(0, import_react.useEffect)(() => bindZurueck(() => {
		if (!useEditor.getState().zurueckTaste()) useEditor.getState().setTab("szenen");
		return true;
	}), []);
	const szene = projekt.szenen.find((eintrag) => eintrag.id === spiel.szeneId) ?? projekt.szenen[0];
	const zeile = (modal?.art === "dialog" ? projekt.dialoge.find((eintrag) => eintrag.id === modal.dialogId) : void 0)?.zeilen.find((eintrag) => modal?.art === "dialog" && eintrag.id === modal.zeileId);
	const choices = zeile ? sichtbareChoices(zeile, spiel, projekt) : [];
	const sprecherNpc = projekt.npcs.find((npc) => npc.name === zeile?.sprecher);
	const probe = modal?.art === "wuerfel" ? projekt.proben.find((eintrag) => eintrag.id === modal.probeId) : void 0;
	const stat = probe ? Number(spiel.variablen[probe.eigenschaft] ?? 0) : 0;
	const quests = projekt.quests.filter((quest) => {
		const status = spiel.questStatus[quest.id];
		return status === "aktiv" || status === "abgeschlossen";
	});
	if (!szene) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-4 text-muted",
		children: "Kein Ort zum Testen."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_18rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => {
								if (!zurueckTaste()) setTab("szenen");
							},
							children: "Zurück"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: szene.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-auto text-sm tabular-nums text-muted",
							children: [spiel.xp, " XP"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: neuesSpiel,
							children: "Neues Spiel"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: modal ? "pointer-events-none" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SzenenCanvas, {
						pfad: hintergrundPfad(projekt, szene),
						projekt,
						objekte: szene.objekte,
						modus: "spiel",
						onActivate: klick
					})
				}),
				zeile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-label": zeile.sprecher,
					className: "mt-3 rounded-2xl bg-paper p-4 text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [sprecherNpc && portraitPfad(projekt, sprecherNpc) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: portraitPfad(projekt, sprecherNpc),
							alt: "",
							className: "h-20 w-14 rounded-lg object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl",
								children: zeile.sprecher
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-pretty leading-relaxed",
								children: textMitWerten(zeile.text, spiel)
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2",
						children: [choices.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							className: "border border-ink/15",
							onClick: () => wahl(choice.id),
							children: choice.text
						}, choice.id)), choices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "wax",
							onClick: weiter,
							children: "Weiter"
						})]
					})]
				}),
				modal?.art === "wuerfel" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-2xl bg-paper p-4 text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl",
							children: probe?.name ?? "Probe"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [
								"W10 + ",
								probe.eigenschaft.slice(0, 1).toUpperCase(),
								probe.eigenschaft.slice(1),
								" (",
								stat,
								") ≥ ",
								probe.schwierigkeit
							]
						}),
						modal.fertig ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-display text-5xl tabular-nums",
								children: modal.wurf
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1",
								children: [
									modal.erfolg ? "Geschafft" : "Daneben",
									" · Summe ",
									modal.summe
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								className: "mt-3",
								tone: "wax",
								onClick: nachWurf,
								children: "Weiter"
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							className: "mt-3",
							tone: "wax",
							onClick: wuerfle,
							children: "Würfeln"
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "scroll-thin grid content-start gap-3 overflow-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-surface p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Auftrag"
						}),
						quests.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Noch kein Auftrag. Die Wirtin im Hirsch weiß mehr."
						}),
						quests.map((quest) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-fg",
									children: quest.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: spiel.questStatus[quest.id] === "abgeschlossen" ? "abgeschlossen" : "aktiv"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 grid gap-1 text-sm",
									children: quest.tasks.map((task) => {
										const fertig = spiel.taskErledigt[`${quest.id}:${task.id}`];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: fertig ? "text-fg" : "text-muted",
											children: [
												fertig ? "✓" : "·",
												" ",
												task.beschreibung
											]
										}, task.id);
									})
								})
							]
						}, quest.id))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-surface p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Beutel"
						}),
						spiel.items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Leer."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 grid gap-2",
							children: spiel.items.map((id) => {
								const gegenstand = projekt.gegenstaende.find((eintrag) => eintrag.id === id);
								const bild = projekt.assets.find((asset) => asset.id === gegenstand?.assetId)?.pfad;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2 text-sm",
									children: [bild && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: bild,
										alt: "",
										className: "size-10 rounded-lg object-cover"
									}), gegenstand?.name ?? id]
								}, id);
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Speicher"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid gap-2",
						children: slots.map((slot, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-line p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: slot ? `${slot.name} · ${new Date(slot.aktualisiert).toLocaleString("de-DE", {
									day: "2-digit",
									month: "2-digit",
									hour: "2-digit",
									minute: "2-digit"
								})}` : `Stand ${index + 1}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									onClick: () => speichernIn(index),
									children: slot ? "Überschreiben" : "Speichern"
								}), slot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									onClick: () => laden(index),
									children: "Laden"
								})]
							})]
						}, slot?.id ?? `leer-${index}`))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Protokoll"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 grid gap-1 text-sm text-muted",
						children: spiel.log.slice(-4).map((zeile, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: zeile }, `${index}-${zeile}`))
					})]
				})
			]
		})]
	});
}
var TABS = [
	{
		id: "szenen",
		label: "Szenen",
		icon: Map
	},
	{
		id: "assets",
		label: "Assets",
		icon: Images
	},
	{
		id: "npcs",
		label: "NPCs",
		icon: Users
	},
	{
		id: "quests",
		label: "Quests",
		icon: ScrollText
	},
	{
		id: "ereignisse",
		label: "Ereignisse",
		icon: Zap
	},
	{
		id: "proben",
		label: "Proben",
		icon: Dices
	},
	{
		id: "variablen",
		label: "Variablen",
		icon: Braces
	},
	{
		id: "testen",
		label: "Testen",
		icon: Play
	}
];
function EditorRoot() {
	const projekt = useEditor((s) => s.projekt);
	const tab = useEditor((s) => s.tab);
	const setTab = useEditor((s) => s.setTab);
	const update = useEditor((s) => s.update);
	const beispiel = useEditor((s) => s.beispiel);
	const importieren = useEditor((s) => s.importieren);
	const datei = (0, import_react.useRef)(null);
	const [sicher, setSicher] = (0, import_react.useState)(false);
	const [fehler, setFehler] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		useEditor.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center gap-3 border-b border-line px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siegel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-muted",
							children: "Build Your Story"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Geschichtenname",
							className: "titel-feld",
							value: projekt.name,
							onChange: (event) => update((p) => ({
								...p,
								name: event.target.value
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => projektExport(projekt),
								children: "Export"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => datei.current?.click(),
								children: "Import"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: datei,
								type: "file",
								accept: "application/json",
								className: "sr-only",
								onChange: (event) => {
									const lese = event.target.files?.[0];
									event.target.value = "";
									if (!lese) return;
									lese.text().then((text) => {
										try {
											const daten = JSON.parse(text);
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
								}
							}),
							sicher ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								tone: "wax",
								onClick: () => {
									beispiel();
									setSicher(false);
								},
								children: "Lindendorf wiederherstellen"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => setSicher(true),
								children: "Beispiel"
							})
						]
					})
				]
			}),
			fehler && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-b border-line px-3 py-2 text-sm text-wax",
				children: fehler
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex gap-1 overflow-x-auto border-b border-line px-2 py-2",
				"aria-label": "Werkstatt",
				children: TABS.map((eintrag) => {
					const Icon = eintrag.icon;
					const aktiv = tab === eintrag.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-current": aktiv ? "page" : void 0,
						onClick: () => setTab(eintrag.id),
						className: `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm ${aktiv ? "bg-raised text-fg" : "text-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							"aria-hidden": "true"
						}), eintrag.label]
					}, eintrag.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "min-h-0 min-w-0 flex-1 overflow-auto",
				children: [
					tab === "szenen" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SzenenEditor, {}),
					tab === "assets" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetBrowser, {}),
					tab === "npcs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NpcEditor, {}),
					tab === "quests" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestEditor, {}),
					tab === "ereignisse" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EreignisEditor, {}),
					tab === "proben" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProbenEditor, {}),
					tab === "variablen" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariablenEditor, {}),
					tab === "testen" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpielerAnsicht, {})
				]
			})
		]
	});
}
var SplitComponent = EditorRoot;
//#endregion
export { SplitComponent as component };
