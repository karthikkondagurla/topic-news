import ogs from "open-graph-scraper";

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

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

/**
 * Fetch OG image & description from a URL using open-graph-scraper.
 * Returns { imageUrl, description } or empty strings on failure.
 */
async function fetchOGMetadata(
    url: string
): Promise<{ imageUrl: string; description: string }> {
    try {
        const data = await ogs({
            url,
            timeout: 8,
            fetchOptions: {
                headers: {
                    "user-agent": USER_AGENT,
                    "accept-language": "en-US,en;q=0.9",
                },
            },
        });

        if (!data.error && data.result) {
            return {
                imageUrl: data.result.ogImage?.[0]?.url ?? "",
                description: data.result.ogDescription ?? "",
            };
        }
    } catch {
        // Silently fall back — some sites block scrapers
    }
    return { imageUrl: "", description: "" };
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

                // Use OGS to fetch the real image & description from the publisher
                const og = await fetchOGMetadata(articleLink);

                return {
                    title,
                    link: articleLink,
                    pubDate: item.pubDate || new Date().toISOString(),
                    sourceName: source,
                    contentSnippet: og.description || rssSnippet,
                    topic: rawTopic,
                    imageUrl: og.imageUrl,
                    description: og.description || rssSnippet,
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
