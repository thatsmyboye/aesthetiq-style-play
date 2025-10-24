import React, { useState } from "react";
import type { Consent } from "@/state/consent";
import { logEvent } from "@/state/events";

export default function ConsentBanner({
  initial, onAcceptAll, onManage, onSave
}: {
  initial: Consent;
  onAcceptAll: () => void;
  onManage: () => void;
  onSave: (c: Consent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Consent>(initial);

  return (
    <>
      {!open && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-background p-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-foreground">
                AesthetIQ uses minimal data to run. We add affiliate parameters to product links and log basic usage to improve the app.
                <a href="/privacy" className="ml-1 underline">Learn more</a>.
              </div>
              <div className="flex gap-2">
                <button className="rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 py-2 text-sm" onClick={()=>{ setOpen(true); onManage(); }}>
                  Manage
                </button>
                <button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 text-sm" onClick={()=>{ logEvent("consent_accept_all"); onAcceptAll(); }}>
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full sm:max-w-lg rounded-2xl bg-background p-4 sm:p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Privacy settings</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Choose what you're comfortable with. You can change this later in <a className="underline" href="/privacy">Privacy</a>.
            </p>

            <div className="space-y-3">
              <ToggleRow
                label="Necessary"
                desc="Core storage to keep your taste vector, saved items, and preferences working."
                checked={true}
                disabled
                onChange={()=>{}}
              />
              <ToggleRow
                label="Analytics"
                desc="Anonymous event logs to improve recommendations (e.g., clicks, feature usage)."
                checked={draft.analytics}
                onChange={(v)=>setDraft({...draft, analytics: v})}
              />
              <ToggleRow
                label="Affiliate parameters"
                desc="Add click_id/UTM/aff parameters to outbound product links for attribution."
                checked={draft.affiliate}
                onChange={(v)=>setDraft({...draft, affiliate: v})}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground py-2" onClick={()=>setOpen(false)}>Cancel</button>
              <button className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 py-2" onClick={()=>{ logEvent("consent_saved", { analytics: draft.analytics, affiliate: draft.affiliate }); onSave(draft); setOpen(false); }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({ label, desc, checked, onChange, disabled=false }:{
  label:string; desc:string; checked:boolean; onChange:(v:boolean)=>void; disabled?:boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <label className={`inline-flex cursor-pointer select-none items-center ${disabled?"opacity-60":""}`}>
        <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={e=>onChange(e.target.checked)} />
        <span className={`h-6 w-10 rounded-full relative transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
        </span>
      </label>
    </div>
  );
}
