export interface Article {
    title: string;
    link: string;
    pubDate: string;
    sourceName: string;
    contentSnippet: string;
    topic: string;
    imageUrl?: string;
    description?: string;
}

export async function fetchRSS(topics: string[]): Promise<Article[]> {
    const allArticles: Article[] = [];

    for (const rawTopic of topics) {
        const encodedTopic = encodeURIComponent(rawTopic.trim());
        const googleRssUrl = `https://news.google.com/rss/search?q=${encodedTopic}&hl=en-US&gl=US&ceid=US:en`;

        // Use rss2json to parse the Google News RSS feed (it returns proper links)
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleRssUrl)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                console.error(`rss2json failed for topic "${rawTopic}"`);
                continue;
            }

            const data = await response.json();
            if (data.status !== "ok" || !data.items) {
                console.error(`rss2json returned error for topic "${rawTopic}"`);
                continue;
            }

            // Process articles concurrently — run OGS on every link in parallel
            const articlesPromises = data.items.map(async (item: any) => {
                // Parse title & source from "Real Title - Source Name" format
                let title = item.title || "Untitled Article";
                let source = "Unknown Source";

                if (title.includes(" - ")) {
                    const parts = title.split(" - ");
                    source = parts.pop() || source;
                    title = parts.join(" - ");
                }

                const articleLink = item.link || "";
                const rssSnippet = (item.description || item.content || "")
                    .replace(/<[^>]*>?/gm, "")
                    .substring(0, 150);

                return {
                    title,
                    link: articleLink,
                    pubDate: item.pubDate || new Date().toISOString(),
                    sourceName: source,
                    contentSnippet: rssSnippet,
                    topic: rawTopic,
                };
            });

            const articles = await Promise.all(articlesPromises);
            allArticles.push(...articles);
        } catch (error) {
            console.error(`Error fetching RSS for topic "${rawTopic}":`, error);
        }
    }

    // Sort by date descending
    allArticles.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    return allArticles;
}
