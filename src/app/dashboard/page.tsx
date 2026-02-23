"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import SearchBar from "@/components/SearchBar";
import TopicPill from "@/components/TopicPill";
import NewsCard, { Article } from "@/components/NewsCard";
import SkeletonNewsCard from "@/components/SkeletonNewsCard";
import styles from "./dashboard.module.css";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [topics, setTopics] = useState<string[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isTopicsLoading, setIsTopicsLoading] = useState(false);
    const [isNewsLoading, setIsNewsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // BYOK State
    const [groqApiKey, setGroqApiKey] = useState("");
    const [isSavingKey, setIsSavingKey] = useState(false);
    const [keySavedMessage, setKeySavedMessage] = useState("");


    // 1. Authenticate
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setUser(session.user);
            }
            setIsAuthLoading(false);
        };
        checkUser();
    }, [router]);

    // 2. Fetch Topics from DB
    const fetchTopics = useCallback(async () => {
        if (!user) return;
        setIsTopicsLoading(true);

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("saved_topics, groq_api_key")
                .eq("id", user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error("Database error. Did you run the SQL script in Supabase?");
            }

            const userTopics = data?.saved_topics || [];
            setTopics(userTopics);
            if (data?.groq_api_key) {
                setGroqApiKey(data.groq_api_key);
            }

            // If they have topics, fetch news immediately
            if (userTopics.length > 0) {
                fetchNews(userTopics);
            }
        } catch (err: any) {
            console.error("Error fetching topics:", err);
            setError(err.message || "Failed to load topics. Please ensure you ran the supabase-schema.sql script in your Supabase dashboard.");
        } finally {
            setIsTopicsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    // 3. Fetch News from our API Route
    const fetchNews = async (currentTopics: string[]) => {
        if (currentTopics.length === 0) {
            setArticles([]);
            return;
        }

        setIsNewsLoading(true);
        setError(null);
        let allArticles: Article[] = [];

        try {
            // Fetch news for each topic in parallel
            const promises = currentTopics.map(topic =>
                fetch(`/api/news?topic=${encodeURIComponent(topic)}`).then(res => res.json())
            );

            const results = await Promise.all(promises);

            results.forEach(result => {
                if (result.articles) {
                    allArticles = [...allArticles, ...result.articles];
                }
            });

            // Sort by newest first
            allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
            setArticles(allArticles);

        } catch (err) {
            console.error("Failed to fetch news", err);
            setError("Failed to load your latest news feed.");
        } finally {
            setIsNewsLoading(false);
        }
    };

    // 4. Add a new topic
    const handleAddTopic = async (topic: string) => {
        if (!user || topics.includes(topic)) return;

        const newTopics = [...topics, topic];
        setTopics(newTopics); // Optimistic UI update

        // Update DB
        const { error } = await supabase
            .from("profiles")
            .upsert({ id: user.id, saved_topics: newTopics });

        if (error) {
            console.error("Error saving topic:", error);
            setError("Cannot save topic: It looks like the 'profiles' table doesn't exist yet. Please run the supabase-schema.sql script in your Supabase dashboard.");
            // Revert if failed
            setTopics(topics);
            return;
        }

        fetchNews(newTopics);
    };

    // 5. Remove a topic
    const handleRemoveTopic = async (topicToRemove: string) => {
        if (!user) return;

        const newTopics = topics.filter(t => t !== topicToRemove);
        setTopics(newTopics);

        // Update DB
        await supabase
            .from("profiles")
            .upsert({ id: user.id, saved_topics: newTopics });

        fetchNews(newTopics);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleSaveApiKey = async () => {
        if (!user) return;
        setIsSavingKey(true);
        setKeySavedMessage("");

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ groq_api_key: groqApiKey })
                .eq("id", user.id);

            if (error) throw error;
            setKeySavedMessage("Key securely saved!");
            setTimeout(() => setKeySavedMessage(""), 3000);
        } catch (err) {
            console.error("Failed to save API Key:", err);
            setKeySavedMessage("Failed to save key.");
        } finally {
            setIsSavingKey(false);
        }
    };

    if (isAuthLoading) {
        return <div className={styles.loadingScreen}>Authenticating...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <h1 className={styles.logo}>Topic News</h1>
                        <button onClick={handleSignOut} className={styles.signOutBtn} title="Sign Out">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container">
                <section className={styles.apiKeySection}>
                    <div className={styles.apiBox}>
                        <h3>Activate AI Summaries</h3>
                        <p>Get a <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">free Groq API Key</a> to unlock 3-bullet point summaries and sentiment analysis.</p>

                        <div className={styles.apiInputRow}>
                            <input
                                type="password"
                                placeholder="gsk_..."
                                value={groqApiKey}
                                onChange={(e) => setGroqApiKey(e.target.value)}
                                className={styles.apiInput}
                            />
                            <button
                                onClick={handleSaveApiKey}
                                disabled={isSavingKey || !groqApiKey.startsWith("gsk_")}
                                className={styles.apiSaveBtn}
                            >
                                {isSavingKey ? "Saving..." : "Save Key"}
                            </button>
                        </div>
                        {keySavedMessage && <span className={styles.apiMsg}>{keySavedMessage}</span>}
                    </div>
                </section>

                <section className={styles.topicSection}>
                    <div className={styles.searchContainer}>
                        <SearchBar onAddTopic={handleAddTopic} isLoading={isTopicsLoading} />
                    </div>

                    <div className={styles.topicsWrapper}>
                        {topics.length === 0 && !isTopicsLoading && (
                            <p className={styles.emptyTopicsTxt}>Add a topic above to start curating your news feed.</p>
                        )}
                        <div className={styles.pillContainer}>
                            {topics.map((topic) => (
                                <TopicPill
                                    key={topic}
                                    topic={topic}
                                    onRemove={handleRemoveTopic}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {error && <div className={styles.errorBox}>{error}</div>}

                <section className={styles.feedSection}>
                    <h2 className={styles.feedTitle}>Your Curated Feed</h2>

                    <div className="main-grid">
                        {isNewsLoading ? (
                            // Show 6 skeletons while loading
                            [...Array(6)].map((_, i) => <SkeletonNewsCard key={i} />)
                        ) : articles.length > 0 ? (
                            articles.map((article, index) => (
                                <NewsCard key={`${article.link}-${index}`} article={article} />
                            ))
                        ) : (
                            !isTopicsLoading && topics.length > 0 && (
                                <p className={styles.emptyFeedTxt}>No recent news found for your topics.</p>
                            )
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
