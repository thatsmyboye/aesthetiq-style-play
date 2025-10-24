import { Link } from "react-router-dom";
import { loadDecks } from "@/state/decks";
import { trackFeature } from "@/utils/tracking";
import { useEffect } from "react";

const Decks = () => {
  const decks = loadDecks();

  useEffect(() => {
    trackFeature("view_decks_list");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-2">Play a Deck</h1>
        <p className="text-muted-foreground">
          Curated collections from brands and creators
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No decks available yet</p>
          <Link 
            to="/partners" 
            className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create a Deck
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              to={`/decks/${deck.id}`}
              className="group rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={deck.coverImage || "/img/deck-default.jpg"}
                  alt={deck.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">
                  {deck.creatorId}
                  {deck.sponsored && " • Sponsored"}
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {deck.title}
                </h3>
                {deck.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {deck.description}
                  </p>
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {deck.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary/50 text-secondary-foreground rounded-full px-2 py-0.5 text-xs"
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Decks;
