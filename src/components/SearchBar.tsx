"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
    onAddTopic: (topic: string) => void;
    isLoading?: boolean;
}

export default function SearchBar({ onAddTopic, isLoading = false }: SearchBarProps) {
    const [topic, setTopic] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = topic.trim();
        if (trimmed && !isLoading) {
            onAddTopic(trimmed);
            setTopic("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.searchForm}>
            <div className={`glass ${styles.inputWrapper}`}>
                <Search className={styles.searchIcon} size={20} />
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Add a highly specific topic to track (e.g. 'MCP', 'Cotton')..."
                    className={styles.inputField}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={!topic.trim() || isLoading}
                    title="Add Topic"
                >
                    <Plus size={20} />
                </button>
            </div>
        </form>
    );
}
