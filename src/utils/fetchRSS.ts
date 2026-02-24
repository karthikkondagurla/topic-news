import Parser from "rss-parser";

const parser = new Parser({
    customFields: {
        item: ['source', 'pubDate'],
    },
});

export interface Article {
    title: string;
    link: string;
    pubDate: string;
    sourceName: string;
    contentSnippet: string;
    topic: string;
}

export async function fetchRSS(topics: string[]): Promise<Article[]> {
    const allArticles: Article[] = [];

    for (const rawTopic of topics) {
        // URL Encode the topic for safety
        const encodedTopic = encodeURIComponent(rawTopic.trim());
        const feedUrl = `https://news.google.com/rss/search?q=${encodedTopic}&hl=en-US&gl=US&ceid=US:en`;

        try {
            const feed = await parser.parseURL(feedUrl);

            // Map the bloated RSS fields into our clean Article interface
            const articles = feed.items.map((item) => {
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
                    link: item.link || "",
                    pubDate: item.pubDate || new Date().toISOString(),
                    sourceName: source,
                    contentSnippet: item.contentSnippet || "",
                    topic: rawTopic,
                };
            });

            allArticles.push(...articles);
        } catch (error) {
            console.error(`Error fetching RSS feed for topic ${rawTopic}:`, error);
        }
    }

    // Sort all combined articles by date descending
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return allArticles;
}
