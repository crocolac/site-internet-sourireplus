"use client";

import { useEffect, useState } from "react";
import { channelFromSearch, chooseMeasurement, readChoice, recordFirstAppointmentClick, recordVisit } from "./acquisition-client";
export { getAdAttribution } from "./acquisition-client";

// Kept for the existing homepage import; measurement is now mounted once in RootLayout.
export function AdAttribution() { return null; }

export function SiteAcquisition() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const choice = readChoice();
    setReady(true);
    setShow(!choice);
    if (choice?.accepted) void recordVisit();
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const el = event.target.closest('button[aria-haspopup="dialog"].nav-appointment, button[aria-haspopup="dialog"].primary-cta, a[href]');
      if (!el) return;
      if (el instanceof HTMLAnchorElement) {
        const u = new URL(el.href, window.location.href);
        if (u.origin !== window.location.origin || u.pathname !== "/" || u.hash !== "#rendez-vous") return;
      }
      // Do not prevent navigation or wait for analytics before opening the form.
      void recordFirstAppointmentClick();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  useEffect(() => {
    if (!ready || show) return;
    const choice = readChoice();
    const timer = setTimeout(() => { if (!readChoice()) setShow(true); }, Math.max(1000, (choice?.until || Date.now()) - Date.now() + 100));
    return () => clearTimeout(timer);
  }, [ready, show]);
  function decide(accepted: boolean) {
    chooseMeasurement(accepted, channelFromSearch(window.location.search));
    setShow(false);
    if (accepted) void recordVisit();
  }
  if (!ready) return null;
  if (!show) return (
    <button type="button" className="ad-measurement-choice" onClick={() => setShow(true)}
      style={{position:"fixed",bottom:8,left:8,zIndex:40,fontSize:14,padding:"7px 10px",background:"#fff",color:"#334155",border:"1px solid #cbd5e1",borderRadius:6}}>
      Mesure des visites
    </button>
  );
  return (
    <aside aria-label="Votre choix de mesure des visites" style={{position:"fixed",bottom:16,left:16,right:16,maxWidth:660,margin:"0 auto",zIndex:40,background:"white",color:"#172b43",border:"1px solid #cbd5e1",borderRadius:16,padding:20,boxShadow:"0 8px 40px #0002",fontSize:16,lineHeight:1.5}}>
      <strong>Nous aider à améliorer la prise de rendez-vous ?</strong>
      <p style={{margin:"8px 0 14px"}}>Avec votre accord, SourirePlus mesure cette visite, le premier clic de réservation et une éventuelle confirmation, par un identifiant pseudonyme. La mesure distingue notre publicité ChatGPT des autres visites. Le choix dure 30 minutes dans cet onglet. Aucune coordonnée ni information médicale n’est envoyée à OpenAI. Refuser ne change pas la réservation.</p>
      <a href="/mesure-publicitaire/" style={{color:"#245ac1"}}>Détails et conservation des données</a>
      <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
        <button type="button" onClick={() => decide(false)} style={{padding:"10px 20px",border:"1px solid #64748b",borderRadius:8,background:"white",color:"#172b43",font:"inherit"}}>Refuser</button>
        <button type="button" onClick={() => decide(true)} style={{padding:"10px 20px",border:"1px solid #64748b",borderRadius:8,background:"white",color:"#172b43",font:"inherit"}}>Accepter</button>
      </div>
    </aside>
  );
}
