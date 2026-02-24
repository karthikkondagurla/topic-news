"use client";

import { X } from "lucide-react";

interface TopicPillProps {
    topic: string;
    onRemove: (topic: string) => void;
}

export default function TopicPill({ topic, onRemove }: TopicPillProps) {
    return (
        <div className="flex items-center gap-2 bg-white dark:bg-card-dark py-2 px-4 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {topic}
            </span>
            <button
                onClick={() => onRemove(topic)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5 rounded-full transition-colors flex items-center justify-center -mr-1"
                aria-label={`Remove ${topic}`}
            >
                <X size={14} strokeWidth={3} />
            </button>
        </div>
    );
}
