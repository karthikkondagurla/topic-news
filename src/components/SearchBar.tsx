"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    onAddTopic: (topic: string) => void;
    isLoading?: boolean;
}

export default function SearchBar({ onAddTopic, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed && !isLoading) {
            onAddTopic(trimmed);
            setQuery("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
            <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            />
            <input
                type="text"
                placeholder="Search topics (e.g. Lithium, AI, Shipping...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-subtle text-[15px] disabled:opacity-50 disabled:cursor-not-allowed group"
            />
            <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Adding..." : "Add"}
            </button>
        </form>
    );
}
