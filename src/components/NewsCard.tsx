"use client";

import { ExternalLink, Clock, Sparkles, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import styles from "./NewsCard.module.css";
import { useState } from "react";

export interface Article {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    contentSnippet?: string;
    topic?: string;
}

interface NewsCardProps {
    article: Article;
    groqApiKey?: string; // Passed down from dashboard
}

export default function NewsCard({ article, groqApiKey }: NewsCardProps) {
    const publishedAt = new Date(article.pubDate);
    const timeAgo = formatDistanceToNow(publishedAt, { addSuffix: true });

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

    return (
        <article className={`glass ${styles.card}`}>
            <div className={styles.header}>
                <span className={styles.source}>{article.source}</span>
                {article.topic && <span className={styles.topicBadge}>{article.topic}</span>}
            </div>

            <h3 className={styles.title}>
                <a href={article.link} target="_blank" rel="noopener noreferrer" className={styles.titleLink}>
                    {article.title}
                </a>
            </h3>

            {article.contentSnippet && (
                <p className={styles.snippet}>{article.contentSnippet}</p>
            )}

            {/* AI Summarization Block */}
            {groqApiKey && summary.length === 0 && !isLoadingAI && !aiError && (
                <button className={styles.aiBtn} onClick={handleSummarize}>
                    <Sparkles size={14} /> Summarize with AI
                </button>
            )}

            {isLoadingAI && (
                <div className={styles.aiLoading}>
                    <Sparkles className={styles.spinIcon} size={14} />
                    <span>Analyzing article...</span>
                </div>
            )}

            {aiError && (
                <div className={styles.aiError}>
                    <AlertCircle size={14} />
                    <span>{aiError}</span>
                </div>
            )}

            {summary.length > 0 && (
                <div className={styles.aiResultBox}>
                    <div className={styles.aiHeaderRow}>
                        <span className={styles.aiLabel}><Sparkles size={12} /> AI Summary</span>
                        <span className={`${styles.sentimentBadge} ${styles[sentiment?.toLowerCase() || 'neutral']}`}>
                            {sentiment}
                        </span>
                    </div>
                    <ul className={styles.summaryList}>
                        {summary.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={styles.footer}>
                <div className={styles.timeWrapper}>
                    <Clock size={14} className={styles.clockIcon} />
                    <time dateTime={article.pubDate} className={styles.timeTag}>
                        {timeAgo}
                    </time>
                </div>
                <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.readMore}
                >
                    Read <ExternalLink size={14} className={styles.readIcon} />
                </a>
            </div>
        </article>
    );
}
