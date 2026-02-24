"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const SUGGESTED_TOPICS = [
    { name: "Semiconductor Lithography", category: "Technology" },
    { name: "Generative AI", category: "Technology" },
    { name: "Quantum Computing", category: "Technology" },
    { name: "Electric Vehicles", category: "Automotive" },
    { name: "Battery Tech", category: "Energy" },
    { name: "Space Exploration", category: "Aerospace" },
    { name: "Synthetic Biology", category: "Biotech" },
    { name: "Nuclear Fusion", category: "Energy" },
    { name: "Cybersecurity", category: "Technology" },
    { name: "Autonomous Driving", category: "Automotive" },
    { name: "Smart Agriculture", category: "AgriTech" },
    { name: "Fintech", category: "Finance" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Ensure user is logged in
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login"); // Redirect to login if not authenticated
            } else {
                setUser(session.user);
            }
        };
        checkAuth();
    }, [router]);

    const handleTopicToggle = (topicName: string) => {
        if (selectedTopics.includes(topicName)) {
            setSelectedTopics(selectedTopics.filter(t => t !== topicName));
        } else {
            setSelectedTopics([...selectedTopics, topicName]);
        }
    };

    const handleContinue = async () => {
        if (!user || selectedTopics.length < 3) return;

        setIsSaving(true);
        try {
            // Check if profile exists, if not, it will be implicitly created by upsert
            // (assuming your SQL setup handles auth.users trigger)
            const { error } = await supabase
                .from("profiles")
                .upsert({ id: user.id, saved_topics: selectedTopics });

            if (error) {
                console.error("Error saving topics:", error);
                alert("Failed to save topics. Please try again.");
                setIsSaving(false);
                return;
            }

            // Redirect to dashboard on success
            router.push("/dashboard");
        } catch (error) {
            console.error("Unexpected error:", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col md:flex-row antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">

            {/* Left Section - Graphic / Intro */}
            <div className="w-full md:w-2/5 md:h-screen sticky top-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 lg:p-16 flex flex-col justify-between overflow-hidden relative">

                {/* Decorative Mesh Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent opacity-50 z-0"></div>
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-100 to-transparent dark:from-slate-900 z-0"></div>

                <div className="relative z-10 flex flex-col items-start gap-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                            <span className="material-symbols-outlined text-[24px]">dataset</span>
                        </div>
                        <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Pigeon</h1>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-sm animate-slide-up-subtle">
                    <h2 className="text-4xl font-bold font-display text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                        What industries are you tracking?
                    </h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        Curate your professional intelligence feed. Select at least <strong>3 topics</strong> to build your personalized stream of insights, analysis, and news.
                    </p>
                </div>

                <div className="relative z-10 pb-8 mt-12 md:mt-0 opacity-40">
                    <div className="flex gap-2 text-primary">
                        <span className="material-symbols-outlined animation-delay-100">horizontal_rule</span>
                        <span className="material-symbols-outlined animation-delay-200">horizontal_rule</span>
                        <span className="material-symbols-outlined animation-delay-300">horizontal_rule</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Topic Selection */}
            <div className="flex-1 overflow-y-auto px-6 py-12 lg:px-24 flex flex-col relative h-screen">
                <div className="max-w-3xl w-full mx-auto animate-fade-in flex-1">

                    {/* Header mobile only */}
                    <div className="md:hidden space-y-2 mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Choose your topics</h2>
                        <p className="text-slate-500">Select at least 3 to continue.</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-10 flex items-center justify-between sticky top-0 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-20">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                {/* Circular Progress SVG */}
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-200 dark:text-slate-800 stroke-current"
                                        strokeWidth="3"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-primary stroke-current transition-all duration-500 ease-out"
                                        strokeWidth="3"
                                        strokeDasharray={`${Math.min((selectedTopics.length / 3) * 100, 100)}, 100`}
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-xl font-bold font-display ${selectedTopics.length >= 3 ? 'text-primary' : 'text-slate-400'}`}>
                                        {selectedTopics.length}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">Target Reached</h3>
                                <p className="text-xs text-slate-500">Select 3 or more topics</p>
                            </div>
                        </div>

                        {/* Mobile Action Button (Sticky) */}
                        <div className="md:hidden">
                            <button
                                onClick={handleContinue}
                                disabled={selectedTopics.length < 3 || isSaving}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-subtle ${selectedTopics.length >= 3
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:shadow-float"
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                                    }`}
                            >
                                {isSaving ? "Setting up..." : "Build Stream"}
                            </button>
                        </div>
                    </div>

                    {/* Topic Categories */}
                    <div className="space-y-12 pb-24">

                        {/* Grouping topics by category */}
                        {Array.from(new Set(SUGGESTED_TOPICS.map(t => t.category))).map(category => (
                            <div key={category} className="space-y-4 animate-slide-up-subtle">
                                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{category}</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {SUGGESTED_TOPICS.filter(t => t.category === category).map((topic) => {
                                        const isSelected = selectedTopics.includes(topic.name);
                                        return (
                                            <button
                                                key={topic.name}
                                                onClick={() => handleTopicToggle(topic.name)}
                                                className={`group flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-200 ${isSelected
                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                    : "bg-white dark:bg-card-dark border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-subtle"
                                                    }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isSelected
                                                    ? "bg-primary border-primary"
                                                    : "border-slate-300 dark:border-slate-600 group-hover:border-primary/50"
                                                    }`}>
                                                    {isSelected && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                                                        {topic.name}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Action Footer (Sticky Bottom) */}
                <div className="hidden md:block fixed bottom-0 left-[40%] right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-6 z-30">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            {selectedTopics.length < 3
                                ? `Select ${3 - selectedTopics.length} more topic${3 - selectedTopics.length === 1 ? '' : 's'}`
                                : "Excellent choices. Ready to build your feed."
                            }
                        </p>
                        <button
                            onClick={handleContinue}
                            disabled={selectedTopics.length < 3 || isSaving}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold transition-all shadow-subtle ${selectedTopics.length >= 3
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:shadow-float hover:-translate-y-0.5"
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                                }`}
                        >
                            {isSaving ? "Building Stream..." : "Build Stream"}
                            <span className="material-symbols-outlined font-bold text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
