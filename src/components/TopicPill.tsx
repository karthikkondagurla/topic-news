"use client";

import { X } from "lucide-react";
import styles from "./TopicPill.module.css";

interface TopicPillProps {
    topic: string;
    onRemove?: (topic: string) => void;
    isActive?: boolean;
    onClick?: (topic: string) => void;
}

export default function TopicPill({ topic, onRemove, isActive, onClick }: TopicPillProps) {
    return (
        <div
            className={`glass ${styles.pill} ${isActive ? styles.active : ''}`}
            onClick={() => onClick && onClick(topic)}
            role={onClick ? "button" : "presentation"}
            tabIndex={onClick ? 0 : -1}
        >
            <span className={styles.label}>{topic}</span>
            {onRemove && (
                <button
                    className={styles.removeBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(topic);
                    }}
                    aria-label={`Remove ${topic}`}
                    title="Remove Topic"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
