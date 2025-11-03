// Tiny argv parser to avoid heavy deps.
// Supports: --flag, --flag=value, --flag=a,b,c
export type Argv = Record<string, string | boolean>;

export function parseArgv(argv: string[]): Argv {
  const out: Argv = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const eq = raw.indexOf("=");
    if (eq === -1) {
      out[raw.slice(2)] = true;
    } else {
      const k = raw.slice(2, eq);
      const v = raw.slice(eq + 1);
      out[k] = v;
    }
  }
  return out;
}

export function csv(val: string | boolean | undefined): string[] | undefined {
  if (typeof val !== "string") return undefined;
  return val.split(",").map(s => s.trim()).filter(Boolean);
}