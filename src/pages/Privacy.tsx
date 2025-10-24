import React, { useState } from "react";
import { loadConsent, saveConsent, ensureConsent, type Consent } from "@/state/consent";
import { ERASE_CONFIRM_TEXT } from "@/config/privacy";
import { logEvent } from "@/state/events";

export default function PrivacyPage(){
  const existing = loadConsent() || ensureConsent();
  const [draft, setDraft] = useState<Consent>(existing);
  const [confirm, setConfirm] = useState("");

  function onSave(){
    saveConsent({ ...draft, givenAt: Date.now() });
    logEvent("consent_saved", { analytics: draft.analytics, affiliate: draft.affiliate });
    alert("Privacy settings saved.");
  }

  async function onErase(){
    if (confirm !== ERASE_CONFIRM_TEXT) { alert(`Type ${ERASE_CONFIRM_TEXT} to confirm.`); return; }
    logEvent("data_erased");
    eraseAllLocalData();
    alert("Your local data has been erased.");
    location.reload();
  }

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Privacy</h1>
      <section className="rounded-2xl border border-border p-3 space-y-2">
        <h2 className="font-medium">What we store</h2>
        <ul className="list-disc ml-6 text-sm text-muted-foreground space-y-1">
          <li><b>Taste data</b>: aesthetic vector, palette, choices (local).</li>
          <li><b>Saved items</b>: favorites and partner-imported products (local).</li>
          <li><b>Affiliate attribution</b>: optional <code className="bg-muted px-1 rounded">click_id</code>, <code className="bg-muted px-1 rounded">utm_*</code>, <code className="bg-muted px-1 rounded">deck</code> in outbound links.</li>
          <li><b>Usage events</b>: optional anonymous feature usage (no PII).</li>
        </ul>
        <p className="text-sm text-muted-foreground">We don't sell personal data. Outbound links may earn a commission.</p>
      </section>

      <section className="rounded-2xl border border-border p-3 space-y-3">
        <h2 className="font-medium">Your controls</h2>
        <Toggle label="Analytics" checked={draft.analytics} onChange={v=>setDraft({...draft, analytics:v})} />
        <Toggle label="Affiliate parameters" checked={draft.affiliate} onChange={v=>setDraft({...draft, affiliate:v})} />
        <button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 text-sm" onClick={onSave}>Save settings</button>
      </section>

      <section className="rounded-2xl border border-border p-3 space-y-2">
        <h2 className="font-medium text-destructive">Erase my data</h2>
        <p className="text-sm text-muted-foreground">This clears your local AesthetIQ data (taste vector, events, favorites, partner imports). Type <code className="bg-muted px-1 rounded">{ERASE_CONFIRM_TEXT}</code> to confirm.</p>
        <div className="flex gap-2">
          <input className="rounded-xl border border-input bg-background px-3 py-2 text-sm" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={ERASE_CONFIRM_TEXT} />
          <button className="rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 py-2 text-sm text-destructive" onClick={onErase}>Erase</button>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-3 space-y-2">
        <h2 className="font-medium">Affiliate parameters we add (if enabled)</h2>
        <div className="text-sm text-muted-foreground">
          <code className="bg-muted px-1 rounded break-all">?src=aesthetiq&click_id=...&utm_source=aesthetiq&utm_medium=referral&utm_campaign=shop_v1&deck={"{deckId}"}</code>
          <div className="mt-2">Plus brand link param (e.g., <code className="bg-muted px-1 rounded">?aff=brand</code>) or a shop's custom param (e.g., <code className="bg-muted px-1 rounded">?ref=abc123</code>).</div>
        </div>
      </section>
    </div>
  );
}

function Toggle({ label, checked, onChange }:{ label:string; checked:boolean; onChange:(v:boolean)=>void; }){
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <div className="inline-flex items-center">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e=>onChange(e.target.checked)} />
        <span className={`h-6 w-10 rounded-full relative transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
        </span>
      </div>
    </label>
  );
}

function eraseAllLocalData(){
  const keys = [
    // taste + observations + events
    "aesthetiq.vector", "aesthetiq.obs.v1", "aesthetiq.events.v1",
    // affiliate click id
    "aesthetiq.click_id", "aesthetiq.click_id_ts",
    // partner/imported data
    "aesthetiq.products.v1", "aesthetiq.decks.v1",
    // admin/calibration flags
    "aesthetiq.calibration_done",
    // consent
    "aesthetiq.cmp.v1",
    // any other app keys
    "partnerProducts", "adminImages"
  ];
  keys.forEach(k=>{ try{ localStorage.removeItem(k); }catch{} });
}
