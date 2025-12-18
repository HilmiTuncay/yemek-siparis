"use client";

import { useState, useEffect, useCallback } from "react";
import { Suggestion } from "@/types";

interface SuggestionBoxProps {
  customerName: string;
}

export default function SuggestionBox({ customerName }: SuggestionBoxProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [suggestionType, setSuggestionType] = useState<"restaurant" | "food">("food");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Varsayilan olarak acik

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch("/api/oneriler");
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Hata durumunda
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 15000);
    return () => clearInterval(interval);
  }, [fetchSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim() || !customerName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/oneriler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: suggestionType,
          text: newSuggestion.trim(),
          submittedBy: customerName.trim(),
        }),
      });

      if (response.ok) {
        setNewSuggestion("");
        fetchSuggestions();
      }
    } catch {
      // Hata durumunda
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    if (!customerName.trim()) return;

    try {
      const response = await fetch("/api/oneriler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId,
          voterName: customerName.trim(),
        }),
      });

      if (response.ok) {
        fetchSuggestions();
      }
    } catch {
      // Hata durumunda
    }
  };

  const hasVoted = (suggestion: Suggestion) => {
    return suggestion.votes.includes(customerName.trim());
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="font-semibold text-purple-800">Oneri ve Oylama</h3>
          {suggestions.length > 0 && (
            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
              {suggestions.length}
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-purple-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {/* Oneri Formu */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSuggestionType("food")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  suggestionType === "food"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-purple-600 border border-purple-300"
                }`}
              >
                🍕 Yemek Onerisi
              </button>
              <button
                type="button"
                onClick={() => setSuggestionType("restaurant")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  suggestionType === "restaurant"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-purple-600 border border-purple-300"
                }`}
              >
                🏪 Restoran Onerisi
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder={suggestionType === "food" ? "Yemek oneriniz..." : "Restoran oneriniz..."}
                className="flex-1 px-3 py-2 rounded-lg border border-purple-300 focus:border-purple-500 focus:outline-none text-sm"
                disabled={!customerName.trim()}
              />
              <button
                type="submit"
                disabled={loading || !newSuggestion.trim() || !customerName.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-300 text-sm"
              >
                {loading ? "..." : "Gonder"}
              </button>
            </div>
            {!customerName.trim() && (
              <p className="text-xs text-purple-600 mt-1">Oneri gondermek icin isminizi girin</p>
            )}
          </form>

          {/* Oneriler Listesi */}
          {suggestions.length === 0 ? (
            <p className="text-center text-purple-600 text-sm py-4">
              Henuz oneri yok. Ilk oneriyi sen yap!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">
                        {suggestion.type === "food" ? "🍕" : "🏪"}
                      </span>
                      <span className="font-medium text-gray-800 truncate">
                        {suggestion.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {suggestion.submittedBy} tarafindan
                    </p>
                  </div>
                  <button
                    onClick={() => handleVote(suggestion.id)}
                    disabled={!customerName.trim()}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      hasVoted(suggestion)
                        ? "bg-purple-500 text-white"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    <span>👍</span>
                    <span>{suggestion.votes.length}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
