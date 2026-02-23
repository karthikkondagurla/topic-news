"use client";

import styles from "./SkeletonNewsCard.module.css";

export default function SkeletonNewsCard() {
    return (
        <div className={`glass ${styles.skeletonCard}`}>
            <div className={styles.header}>
                <div className={`${styles.pulse} ${styles.skeletonSource}`}></div>
                <div className={`${styles.pulse} ${styles.skeletonBadge}`}></div>
            </div>

            <div className={`${styles.pulse} ${styles.skeletonTitle}`}></div>
            <div className={`${styles.pulse} ${styles.skeletonTitleLine2}`}></div>

            <div className={styles.snippetContainer}>
                <div className={`${styles.pulse} ${styles.skeletonTextLine}`}></div>
                <div className={`${styles.pulse} ${styles.skeletonTextLine}`}></div>
                <div className={`${styles.pulse} ${styles.skeletonTextLineShort}`}></div>
            </div>

            <div className={styles.footer}>
                <div className={`${styles.pulse} ${styles.skeletonTime}`}></div>
                <div className={`${styles.pulse} ${styles.skeletonButton}`}></div>
            </div>
        </div>
    );
}
