import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Play from "./pages/Play";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import Partners from "./pages/Partners";
import Admin from "./pages/Admin";
import Decks from "./pages/Decks";
import DeckPlay from "./pages/DeckPlay";
import Privacy from "./pages/Privacy";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { initializeDecks } from "./data/decks.seed";
import { getOrCreateClickId } from "./state/aff";
import { ensureConsent, loadConsent, saveConsent, type Consent } from "./state/consent";
import ConsentBanner from "./components/ConsentBanner";

const queryClient = new QueryClient();

const App = () => {
  const [consent, setConsent] = useState<Consent | null>(ensureConsent());
  const [showCMP, setShowCMP] = useState<boolean>(!loadConsent());

  useEffect(() => {
    initializeDecks();
    getOrCreateClickId();
  }, []);

  useEffect(() => {
    if (consent) saveConsent(consent);
  }, [consent]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/play" replace />} />
              <Route path="/play" element={<Play />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/decks" element={<Decks />} />
              <Route path="/decks/:deckId" element={<DeckPlay />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
        {showCMP && (
          <ConsentBanner
            initial={consent!}
            onAcceptAll={() => {
              const c: Consent = { v: consent!.v, givenAt: Date.now(), necessary: true, analytics: true, affiliate: true };
              setConsent(c);
              setShowCMP(false);
            }}
            onManage={() => setShowCMP(false)}
            onSave={(c) => {
              setConsent({ ...c, v: consent!.v, givenAt: Date.now() });
              setShowCMP(false);
            }}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
