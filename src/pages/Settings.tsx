import React from "react";
import { loadEntitlement } from "@/state/premium";
import { PREMIUM_NAME } from "@/config/premium";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Settings as SettingsIcon, Shield } from "lucide-react";

export default function Settings() {
  const entitlement = loadEntitlement();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-foreground" />
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
      </div>

      {/* Premium Status */}
      <section className="rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg">Premium</h2>
          {entitlement.active ? (
            <Badge variant="default">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline">Free</Badge>
          )}
        </div>
        {entitlement.active ? (
          <div className="text-sm text-muted-foreground">
            <p>Active since {new Date(entitlement.since || Date.now()).toLocaleDateString()}</p>
            <p className="text-xs mt-1">Source: {entitlement.source}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Unlock full match explanations, Deep Matches, exclusive decks, and high-res Wrapped exports.
            </p>
            <Button size="sm" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to {PREMIUM_NAME}
            </Button>
          </div>
        )}
        {entitlement.active && (
          <Button variant="outline" size="sm" onClick={() => {
            // TODO: implement restore purchases / verify subscription
            alert("Restore purchases coming soon");
          }}>
            Restore Purchases
          </Button>
        )}
      </section>

      {/* Privacy */}
      <section className="rounded-2xl border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-foreground" />
          <h2 className="font-medium text-lg">Privacy & Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your consent preferences and data controls.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/privacy'}
        >
          Manage Privacy
        </Button>
      </section>

      {/* About */}
      <section className="rounded-2xl border p-4 space-y-2">
        <h2 className="font-medium text-lg">About</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>AesthetIQ • Version 1.0.0</p>
          <p>Discover products that match your unique aesthetic.</p>
        </div>
      </section>
    </div>
  );
}
