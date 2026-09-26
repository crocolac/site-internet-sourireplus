export type Channel = "chatgpt_ads" | "other_site";
export type Token = { id: string; signature: string; expires_at: number };
export type Choice = { accepted: boolean; until: number; channel?: Channel; id?: string; token?: Token; attempted?: boolean };
export const MEASUREMENT_KEY = "sourireplus-acquisition-v2";
export const CAMPAIGN = "sourireplus_rdv";
const ENDPOINT = "https://mydentalpass.ch/borne/ads-visit.php";
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
let memory: Choice | undefined;
let visitPending: Promise<Token | undefined> | undefined;
let attemptPending: Promise<void> | undefined;
let revision = 0;
const controllers = new Set<AbortController>();

export function channelFromSearch(search: string): Channel {
  const p = new URLSearchParams(search);
  return p.get("utm_source") === "chatgpt" && p.get("utm_medium") === "cpc"
    && p.get("utm_campaign") === CAMPAIGN ? "chatgpt_ads" : "other_site";
}
function validToken(value: unknown): value is Token {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<Token>;
  return typeof t.id === "string" && UUID.test(t.id)
    && typeof t.signature === "string" && /^[a-f0-9]{64}$/.test(t.signature)
    && Number.isSafeInteger(t.expires_at) && (t.expires_at || 0) * 1000 > Date.now();
}
export function readChoice(): Choice | undefined {
  if (memory && memory.until > Date.now()) return memory;
  memory = undefined;
  try {
    const v = JSON.parse(sessionStorage.getItem(MEASUREMENT_KEY) || "null") as Partial<Choice> | null;
    if (v && typeof v.accepted === "boolean" && typeof v.until === "number"
      && v.until > Date.now() && v.until <= Date.now() + 30 * 60 * 1000
      && (!v.accepted || v.channel === "chatgpt_ads" || v.channel === "other_site")) {
      memory = { accepted: v.accepted, until: v.until, channel: v.channel };
      if (v.accepted && typeof v.id === "string" && UUID.test(v.id)) {
        memory.id = v.id;
        if (validToken(v.token) && v.token.id === v.id) memory.token = v.token;
        memory.attempted = v.attempted === true;
      }
      return memory;
    }
    sessionStorage.removeItem(MEASUREMENT_KEY);
  } catch { /* Measurement remains optional when storage is unavailable. */ }
  return undefined;
}
function save(choice: Choice): void {
  memory = choice;
  try { sessionStorage.setItem(MEASUREMENT_KEY, JSON.stringify(choice)); } catch { /* In-memory only. */ }
}
export function chooseMeasurement(accepted: boolean, channel: Channel): void {
  const current = readChoice();
  revision++;
  controllers.forEach(c => c.abort());
  controllers.clear();
  visitPending = undefined;
  attemptPending = undefined;
  if (accepted && current?.accepted) {
    save(current); // Reopening the choice does not create another visit or extend the session.
  } else {
    save(accepted ? { accepted, channel, until: Date.now() + 1800000 }
      : { accepted: false, until: Date.now() + 1800000 });
  }
}
async function post(payload: object): Promise<unknown> {
  const controller = new AbortController();
  controllers.add(controller);
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST", credentials: "omit", referrerPolicy: "no-referrer", keepalive: true,
      headers: { "Content-Type": "application/json" }, signal: controller.signal,
      body: JSON.stringify(payload),
    });
    if (!response.ok || response.status === 204) return undefined;
    return await response.json();
  } catch { return undefined; }
  finally { clearTimeout(timer); controllers.delete(controller); }
}
export function recordVisit(): Promise<Token | undefined> {
  const choice = readChoice();
  if (!choice?.accepted || !choice.channel) return Promise.resolve(undefined);
  if (validToken(choice.token)) return Promise.resolve(choice.token);
  if (visitPending) return visitPending;
  try {
    if (!choice.id) { choice.id = crypto.randomUUID(); save(choice); }
  } catch { return Promise.resolve(undefined); }
  const rev = revision;
  visitPending = (async () => {
    try {
      const result = await post({ action: "visit", consent: true, campaign: CAMPAIGN, channel: choice.channel, id: choice.id });
      if (result && typeof result === "object" && "ok" in result && result.ok === true
        && "attribution" in result && validToken(result.attribution)) {
        const current = readChoice();
        if (rev === revision && current?.accepted && current.id === choice.id
          && result.attribution.id === choice.id) {
          save({ ...current, token: result.attribution, until: Math.min(current.until, result.attribution.expires_at * 1000) });
          return result.attribution;
        }
      }
      return undefined;
    } finally { if (rev === revision) visitPending = undefined; }
  })();
  return visitPending;
}
/** Called on the first booking button click, never on a form field or SMS response. */
export function recordFirstAppointmentClick(): Promise<void> {
  const choice = readChoice();
  if (!choice?.accepted || choice.attempted) return Promise.resolve();
  if (attemptPending) return attemptPending;
  const rev = revision;
  attemptPending = (async () => {
    try {
      const token = await recordVisit();
      const current = readChoice();
      if (!token || rev !== revision || !current?.accepted || current.id !== token.id || current.attempted) return;
      const result = await post({ action: "attempt", consent: true, campaign: CAMPAIGN,
        attribution: { id: token.id, signature: token.signature } });
      const latest = readChoice();
      if (result && typeof result === "object" && "ok" in result && result.ok === true
        && rev === revision && latest?.accepted && latest.id === token.id) {
        save({ ...latest, attempted: true });
      }
    } finally { if (rev === revision) attemptPending = undefined; }
  })();
  return attemptPending;
}
/** Only a pseudonymous signed token reaches the separate appointment request API. */
export async function getAdAttribution(): Promise<Token | undefined> {
  if (!readChoice()?.accepted) return undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const token = await Promise.race([recordVisit(), new Promise<undefined>(resolve => { timer = setTimeout(() => resolve(undefined), 1000); })]);
    return readChoice()?.accepted ? token : undefined;
  } finally { if (timer) clearTimeout(timer); }
}
