const AXIOM_TOKEN = process.env.AXIOM_TOKEN
const AXIOM_DATASET = process.env.AXIOM_DATASET ?? "semmanuel-blog-dataset"
const AXIOM_URL = process.env.AXIOM_URL ?? "https://eu-central-1.aws.edge.axiom.co"

type Level = "info" | "warn" | "error"
type Fields = Record<string, unknown>

const queue: Record<string, unknown>[] = []

export function formatError(err: unknown): Fields {
  if (err instanceof Error) {
    return { error: err.message, errorType: err.name, stack: err.stack }
  }
  return { error: String(err) }
}

function log(level: Level, event: string, fields: Fields = {}) {
  const entry = {
    _time: new Date().toISOString(),
    level,
    event,
    env: process.env.NODE_ENV,
    ...fields,
  }
  if (level === "error") console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
  if (AXIOM_TOKEN) queue.push(entry)
}

async function flush(): Promise<void> {
  if (!AXIOM_TOKEN || queue.length === 0) return
  const events = queue.splice(0)
  try {
    await fetch(`${AXIOM_URL}/v1/ingest/${AXIOM_DATASET}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AXIOM_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    })
  } catch (err) {
    console.error("Axiom ingest failed:", String(err))
  }
}

export const logger = {
  info:  (event: string, fields?: Fields) => log("info",  event, fields),
  warn:  (event: string, fields?: Fields) => log("warn",  event, fields),
  error: (event: string, fields?: Fields) => log("error", event, fields),
  flush,
}
