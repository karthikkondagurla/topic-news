import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(request: Request) {
    try {
        const { apiKey, title, contentSnippet } = await request.json();

        if (!apiKey || !apiKey.startsWith("gsk_")) {
            return NextResponse.json(
                { error: "Invalid or missing Groq API Key" },
                { status: 401 }
            );
        }

        if (!title && !contentSnippet) {
            return NextResponse.json(
                { error: "Missing article title or content" },
                { status: 400 }
            );
        }

        // Initialize Groq with the user's BYOK
        const groq = new Groq({ apiKey: apiKey });

        const prompt = `
        You are an expert news summarizer. I am giving you the title and a short snippet of a news article. 
        Your job is to provide exactly two things in a strict JSON format:
        1. A "summary" array containing exactly 3 bullet points (strings) summarizing the key takeaways. Make them punchy.
        2. A "sentiment" string that is exactly one of these three words: "Positive", "Neutral", "Negative".

        Title: ${title}
        Snippet: ${contentSnippet || "No snippet available."}

        Respond ONLY with a valid JSON object matching this TypeScript interface:
        {
            "summary": string[], // Exactly 3 items
            "sentiment": "Positive" | "Neutral" | "Negative"
        }
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192", // Fast, free inference model
            temperature: 0.1,
            response_format: { type: "json_object" }, // Ensures valid JSON return
        });

        const output = chatCompletion.choices[0]?.message?.content;

        if (!output) {
            throw new Error("Empty response from Groq");
        }

        const parsedResult = JSON.parse(output);

        return NextResponse.json(parsedResult);

    } catch (error: any) {
        console.error("AI Summarization error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate AI summary" },
            { status: 500 }
        );
    }
}
