import React from "react";
import { PREMIUM_NAME, PREMIUM_PRICE, PREMIUM_TEST_MODE } from "@/config/premium";
import { saveEntitlement } from "@/state/premium";
import { logEvent } from "@/state/events";

export default function Paywall({ open, onClose, feature }: {
  open: boolean; onClose: ()=>void; feature: "why"|"deep"|"wrapped";
}) {
  if (!open) return null;

  const handleContinue = () => {
    logEvent("paywall_continue_click", { source: PREMIUM_TEST_MODE ? "mock" : "stripe", feature });
    if (PREMIUM_TEST_MODE) {
      saveEntitlement({ active: true, since: Date.now(), source: "mock" });
      logEvent("premium_activated", { source: "mock" });
      onClose();
      alert("Premium activated (test mode). Replace with Stripe Checkout when ready.");
    } else {
      // TODO: open Stripe/Lemon checkout
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">{PREMIUM_NAME}</h2>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        <p className="mt-2 text-sm text-gray-700">
          Unlock {feature === "why" ? "full match explanations" : feature === "deep" ? "Deep Matches & boutique decks" : "high-res Wrapped exports & trendlines"} plus more.
        </p>
        <ul className="mt-3 text-sm text-gray-800 list-disc ml-5 space-y-1">
          <li>Deep Matches on Shop</li>
          <li>Full "Why this match?" breakdown</li>
          <li>Exclusive creator/brand decks</li>
          <li>Wrapped extras & higher-res PNG</li>
          <li>No sponsored interstitials</li>
        </ul>
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{PREMIUM_PRICE}</span>
            <span className="text-gray-600">Cancel anytime</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-xl border py-2" onClick={onClose}>Maybe later</button>
          <button
            className="flex-1 rounded-xl bg-black text-white py-2"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">Test mode is on; implement checkout server next.</p>
      </div>
    </div>
  );
}
