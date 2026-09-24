"use client";

import { useEffect, useState } from "react";

type Token = { id: string; signature: string; expires_at: number };
type Choice = { accepted: boolean; until: number; id?: string; token?: Token };
const KEY = "sourireplus-ad-measurement-v1";
const ENDPOINT = "https://mydentalpass.ch/borne/ads-visit.php";
const CAMPAIGN = "sourireplus_rdv";
let memory: Choice | undefined;
let pending: Promise<Token | undefined> | undefined;

function read(): Choice | undefined {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (value && typeof value === "object" && "until" in value && typeof value.until === "number"
      && value.until > Date.now() && "accepted" in value && typeof value.accepted === "boolean") {
      memory = value as Choice;
    }
  } catch { /* Storage may be disabled. In-memory measurement still works in this page. */ }
  if (memory && memory.until > Date.now()) return memory;
  memory = undefined;
  try { sessionStorage.removeItem(KEY); } catch { /* No storage. */ }
  return undefined;
}
function save(value: Choice): void {
  memory = value;
  try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch { /* No storage. */ }
}
function validToken(value: unknown): value is Token {
  if (!value || typeof value !== "object") return false;
  const token = value as Partial<Token>;
  return typeof token.id === "string" && /^[a-f0-9-]{36}$/.test(token.id)
    && typeof token.signature === "string" && /^[a-f0-9]{64}$/.test(token.signature)
    && typeof token.expires_at === "number" && token.expires_at * 1000 > Date.now();
}
function recordVisit(): Promise<Token | undefined> {
  const choice = read();
  if (!choice?.accepted) return Promise.resolve(undefined);
  if (validToken(choice.token)) return Promise.resolve(choice.token);
  if (pending) return pending;
  if (!choice.id) { choice.id = crypto.randomUUID(); save(choice); }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  pending = (async () => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST", credentials: "omit", referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ id: choice.id, consent: true, campaign: CAMPAIGN }),
      });
      if (!response.ok || response.status === 204) return undefined;
      const data: unknown = await response.json();
      if (data && typeof data === "object" && "attribution" in data && validToken(data.attribution)) {
        const current = read();
        if (current?.accepted && current.id === choice.id) {
          save({ ...current, token: data.attribution, until: data.attribution.expires_at * 1000 });
          return data.attribution;
        }
      }
    } catch { /* Analytics must never block access to care. */ }
    finally { clearTimeout(timeout); pending = undefined; }
    return undefined;
  })();
  return pending;
}

/** Called only by the existing new-appointment request; never sends contact details. */
export async function getAdAttribution(): Promise<Token | undefined> {
  if (!read()?.accepted) return undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      recordVisit(),
      new Promise<undefined>((resolve) => { timeout = setTimeout(() => resolve(undefined), 1500); }),
    ]);
  } finally { if (timeout) clearTimeout(timeout); }
}

export function AdAttribution() {
  const [show, setShow] = useState(false);
  const [decided, setDecided] = useState(false);
  useEffect(() => {
    const choice = read();
    if (choice) {
      setDecided(true);
      if (choice.accepted) void recordVisit();
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("utm_source") === "chatgpt" && params.get("utm_medium") === "cpc"
      && params.get("utm_campaign") === CAMPAIGN) setShow(true);
  }, []);
  function decide(accepted: boolean) {
    save({ accepted, until: Date.now() + 30 * 60 * 1000 });
    setShow(false); setDecided(true);
    if (accepted) void recordVisit();
  }
  if (!show) return decided ? (
    <button type="button" className="ad-measurement-choice" onClick={() => setShow(true)}
      style={{position:"fixed",bottom:8,left:8,zIndex:40,fontSize:11,padding:"5px 8px",background:"#fff",color:"#334155",border:"1px solid #cbd5e1",borderRadius:6}}>
      Mesure publicitaire
    </button>
  ) : null;
  return (
    <aside aria-label="Votre choix de mesure publicitaire" style={{position:"fixed",bottom:16,left:16,right:16,maxWidth:660,margin:"0 auto",zIndex:60,background:"white",color:"#172b43",border:"1px solid #cbd5e1",borderRadius:16,padding:20,boxShadow:"0 8px 40px #0002",fontSize:14,lineHeight:1.5}}>
      <strong>Mesurer l’utilité de notre publicité ?</strong>
      <p style={{margin:"8px 0 14px"}}>Avec votre accord, SourirePlus relie cette visite à une éventuelle réservation par un identifiant pseudonyme. Le choix est conservé 30 minutes dans cet onglet. Aucune coordonnée ni information médicale n’est envoyée à OpenAI. Refuser ne change pas la prise de rendez-vous.</p>
      <a href="/mesure-publicitaire/" style={{color:"#245ac1"}}>Détails et conservation des données</a>
      <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
        <button type="button" onClick={() => decide(false)} style={{padding:"10px 20px",border:"1px solid #64748b",borderRadius:8,background:"white",color:"#172b43",font:"inherit"}}>Refuser</button>
        <button type="button" onClick={() => decide(true)} style={{padding:"10px 20px",border:"1px solid #64748b",borderRadius:8,background:"white",color:"#172b43",font:"inherit"}}>Accepter</button>
      </div>
    </aside>
  );
}
