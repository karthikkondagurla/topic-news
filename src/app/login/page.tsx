"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (isSignUp: boolean, e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Sign Up
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert("Check your email for the login link or log in if auto-confirmed!");
            } else {
                // Log In
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`glass ${styles.authCard}`}>
                <h1 className={styles.title}>Topic News</h1>
                <p className={styles.subtitle}>Curated intelligence for your niche.</p>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.primaryBtn}
                            onClick={(e) => handleAuth(false, e)}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Log In"}
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={(e) => handleAuth(true, e)}
                            disabled={loading}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
