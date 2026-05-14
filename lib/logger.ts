import { Axiom } from "@axiomhq/js";

const axiom =
  process.env.AXIOM_TOKEN
    ? new Axiom({ token: process.env.AXIOM_TOKEN })
    : null;

const DATASET = process.env.AXIOM_DATASET ?? "blog-logs";

type Level = "info" | "warn" | "error";
type Fields = Record<string, unknown>;

export function formatError(err: unknown): Fields {
  if (err instanceof Error) {
    return { error: err.message, errorType: err.name, stack: err.stack };
  }
  return { error: String(err) };
}

function log(level: Level, event: string, fields: Fields = {}) {
  const entry = {
    _time: new Date().toISOString(),
    level,
    event,
    env: process.env.NODE_ENV,
    ...fields,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
  axiom?.ingest(DATASET, [entry]);
}

export const logger = {
  info:  (event: string, fields?: Fields) => log("info",  event, fields),
  warn:  (event: string, fields?: Fields) => log("warn",  event, fields),
  error: (event: string, fields?: Fields) => log("error", event, fields),
  flush: (): Promise<void> => axiom?.flush() ?? Promise.resolve(),
};
