"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import SearchBar from "@/components/SearchBar";
import TopicPill from "@/components/TopicPill";
import NewsCard, { Article } from "@/components/NewsCard";
import SkeletonNewsCard from "@/components/SkeletonNewsCard";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();
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

            if (userTopics.length === 0) {
                // If the user has no topics configured, force them to the onboarding flow
                router.push("/onboarding");
                return;
            }

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
        return <div className="flex h-screen items-center justify-center text-slate-500">Authenticating...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden flex h-screen w-full">
            {/* Sidebar from Stitch */}
            <aside className="w-64 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col justify-between z-20 h-full">
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <div className="flex flex-col mb-8">
                            <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Pigeon</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Industry Tracker</p>
                        </div>
                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
                                <span className="material-symbols-outlined text-primary fill-1" style={{ fontSize: '20px' }}>dashboard</span>
                                <span className="text-sm font-medium">The Stream</span>
                            </button>
                            <Link href="/dashboard/saved" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors" style={{ fontSize: '20px' }}>bookmark</span>
                                <span className="text-sm font-medium">Saved</span>
                            </Link>
                        </div>
                        <div className="mt-8 relative h-64 overflow-y-auto hide-scrollbar">
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Your Topics</p>
                            <div className="space-y-1">
                                {topics.length === 0 && !isTopicsLoading && (
                                    <p className="px-3 text-xs text-slate-500">No topics added.</p>
                                )}
                                {topics.map((topic) => (
                                    <div key={topic} className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                        <Link href={`/dashboard/topic/${encodeURIComponent(topic)}`} className="flex items-center gap-3 truncate cursor-pointer flex-1">
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary" style={{ fontSize: '20px' }}>tag</span>
                                            <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{topic}</span>
                                        </Link>
                                        <button onClick={() => handleRemoveTopic(topic)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative h-full">
                {/* Sticky Header Container */}
                <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between transition-all duration-300">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">The Stream</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto p-8 space-y-10 pb-20">

                    {/* Topic Search Box (Bento Style) */}
                    <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-subtle border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display mb-4">Add Topics</h3>
                        <SearchBar onAddTopic={handleAddTopic} isLoading={isTopicsLoading} />
                    </div>

                    {/* AI Config Box */}
                    <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-subtle border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">AI Summary Settings</h3>
                            <span className="bg-tag-tech text-tag-tech-text text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 rounded-md">Configure</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Provide a free Groq API key to unlock LLM-powered bullet summaries and sentiment tracking entirely in-browser.</p>
                        <div className="flex gap-2 max-w-lg">
                            <input
                                type="password"
                                placeholder="gsk_..."
                                value={groqApiKey}
                                onChange={(e) => setGroqApiKey(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                onClick={handleSaveApiKey}
                                disabled={isSavingKey || !groqApiKey.startsWith("gsk_")}
                                className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                {isSavingKey ? "Saving..." : "Save"}
                            </button>
                        </div>
                        {keySavedMessage && <span className="text-emerald-600 text-xs mt-2 block font-medium">{keySavedMessage}</span>}
                    </div>

                    {/* Filtered Stream Masonry */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                            <button className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-primary pb-2 -mb-2.5">Latest News</button>
                        </div>

                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {isNewsLoading ? (
                                [...Array(6)].map((_, i) => <SkeletonNewsCard key={i} />)
                            ) : articles.length > 0 ? (
                                articles.map((article, index) => (
                                    <NewsCard key={`${article.link}-${index}`} article={article} groqApiKey={groqApiKey} />
                                ))
                            ) : (
                                !isTopicsLoading && topics.length > 0 && (
                                    <p className="text-slate-500 font-medium text-sm">No recent news found for your topics.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
