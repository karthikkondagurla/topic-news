import { NextResponse } from "next/server";
import Parser from "rss-parser";

// We instantiate the parser here
const parser = new Parser({
    customFields: {
        item: ['source', 'pubDate'],
    },
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawTopic = searchParams.get("topic");

    if (!rawTopic) {
        return NextResponse.json(
            { error: "Must provide a 'topic' query parameter" },
            { status: 400 }
        );
    }

    // URL Encode the topic for safety and append when:1d to get only last 24h
    const query = `${rawTopic.trim()} when:1d`;
    const encodedTopic = encodeURIComponent(query);
    const feedUrl = `https://news.google.com/rss/search?q=${encodedTopic}&hl=en-US&gl=US&ceid=US:en`;

    try {
        const feed = await parser.parseURL(feedUrl);

        // Map the bloated RSS fields into our clean Article interface
        const articles = feed.items.map((item, index) => {
            // Google News title formats are often "Real Title - Source Name"
            let title = item.title || "Untitled Article";
            let source = item.source || "Unknown Source";

            if (title.includes(" - ")) {
                const parts = title.split(" - ");
                source = parts.pop() || source;
                title = parts.join(" - ");
            }

            return {
                title: title,
                link: item.link,
                pubDate: item.pubDate || new Date().toISOString(),
                source: source,
                contentSnippet: item.contentSnippet,
                topic: rawTopic,
                rank: index,
            };
        });

        // Return the cleaned array
        return NextResponse.json({ articles });
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
        return NextResponse.json(
            { error: "Failed to fetch news feed" },
            { status: 500 }
        );
    }
}
