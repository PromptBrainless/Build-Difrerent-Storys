import { createFileRoute } from "@tanstack/react-router";
import { EditorRoot } from "@/werkzeug/editor/EditorRoot";

export const Route = createFileRoute("/")({ component: EditorRoot });
