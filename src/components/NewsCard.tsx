"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useReader } from "@/context/ReaderContext";

export interface Article {
    title: string;
    link: string;
    pubDate: string;
    sourceName: string; // Changed from source to sourceName to match api response
    contentSnippet?: string;
    topic?: string;
}

interface NewsCardProps {
    article: Article;
    groqApiKey?: string;
}

export default function NewsCard({ article, groqApiKey }: NewsCardProps) {
    const publishedAt = new Date(article.pubDate);
    const timeAgo = formatDistanceToNow(publishedAt, { addSuffix: true });

    // Reader Modal Context
    const { openReader } = useReader();

    // AI State
    const [summary, setSummary] = useState<string[]>([]);
    const [sentiment, setSentiment] = useState<string | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleSummarize = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!groqApiKey) return;
        setIsLoadingAI(true);
        setAiError(null);

        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: groqApiKey,
                    title: article.title,
                    contentSnippet: article.contentSnippet
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to summarize.");

            setSummary(data.summary);
            setSentiment(data.sentiment);
        } catch (err: any) {
            console.error("Summarization error:", err);
            setAiError(err.message);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const imgSrc = null;
    const formattedDate = timeAgo;
    const aiSummary = summary.length > 0 ? { bullets: summary, sentiment: sentiment } : null;
    const isSummarizing = isLoadingAI;

    return (
        <article className="break-inside-avoid bg-white dark:bg-card-dark rounded-2xl shadow-subtle hover:shadow-float transition-all duration-300 overflow-hidden group border border-slate-100 dark:border-slate-800">
            {imgSrc && (
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={imgSrc}
                        onClick={() => openReader(article, groqApiKey)}
                        style={{ cursor: "pointer" }}
                    />
                    <div className="absolute top-3 left-3">
                        <span className="bg-tag-tech/90 backdrop-blur text-tag-tech-text text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 rounded-md">
                            {article.topic || "News"}
                        </span>
                    </div>
                </div>
            )}
            <div className="p-5">
                {!imgSrc && (
                    <div className="flex justify-between items-start mb-3">
                        <span className="bg-tag-policy text-tag-policy-text text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 rounded-md">
                            {article.topic || "News"}
                        </span>
                    </div>
                )}
                <h2
                    className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-primary transition-colors cursor-pointer"
                    onClick={() => openReader(article, groqApiKey)}
                >
                    {article.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">
                    {article.contentSnippet}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
                    <span className="text-slate-900 dark:text-slate-200">{article.sourceName}</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                </div>

                {/* AI Processing Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    {!aiSummary && !aiError && !isSummarizing ? (
                        <div className="flex justify-end">
                            <button
                                onClick={handleSummarize}
                                disabled={!groqApiKey}
                                title={!groqApiKey ? "Add Groq API Key to enable" : "Summarize with AI"}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${groqApiKey
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
                                Summarize
                            </button>
                        </div>
                    ) : isSummarizing ? (
                        <div className="flex items-center gap-2 text-primary font-medium text-xs">
                            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                            Analyzing...
                        </div>
                    ) : aiError ? (
                        <div className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                            {aiError}
                        </div>
                    ) : aiSummary ? (
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>auto_awesome</span>
                                    AI Summary
                                </span>
                                {aiSummary.sentiment && (
                                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${aiSummary.sentiment === "Positive" ? "bg-emerald-100 text-emerald-800" :
                                        aiSummary.sentiment === "Negative" ? "bg-red-100 text-red-800" :
                                            "bg-slate-200 text-slate-600"
                                        }`}>
                                        {aiSummary.sentiment}
                                    </span>
                                )}
                            </div>
                            <ul className="space-y-2">
                                {aiSummary.bullets.map((bullet, i) => (
                                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span className="leading-relaxed">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
