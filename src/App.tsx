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
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeDecks } from "./data/decks.seed";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeDecks();
  }, []);

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
