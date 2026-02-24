import fs from 'fs/promises';

const screens = {
    home: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzMyZGVmNzBhOGMwNjQ0MjZiMjAzOTRiYTZjZjI0N2VjEgsSBxCnuYPe2gIYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTU2Mzk0Mjk4MTU5MDAxMTQx&filename=&opi=89354086",
    onboarding: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE5NDdlZmQ5NDczOTRhNjFhN2ZmNjMxZWNlYjczMDhjEgsSBxCnuYPe2gIYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTU2Mzk0Mjk4MTU5MDAxMTQx&filename=&opi=89354086",
    prd: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzllMjkzYzRiMGQ0ZTRlYTBhZDdkZTdiMDQzNTliNmQyEgsSBxCnuYPe2gIYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTU2Mzk0Mjk4MTU5MDAxMTQx&filename=&opi=89354086",
    detail: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2M1NzE5MzdlY2RhYjRhMGJiNDIxOGFlY2M2YjU1NTc1EgsSBxCnuYPe2gIYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTU2Mzk0Mjk4MTU5MDAxMTQx&filename=&opi=89354086",
    modal: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE2MDg0YTJhNmI1ZTRhNzA4ZDdlMGE2MDZlNjM5MDMwEgsSBxCnuYPe2gIYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTU2Mzk0Mjk4MTU5MDAxMTQx&filename=&opi=89354086",
    collection: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzBkNmNiOTg4MzE3MzQxYWI5MmQ0Y2QwOTZkOGNjNTQwEgsSBxCnuYPe2gIYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTU2Mzk0Mjk4MTU5MDAxMTQx&filename=&opi=89354086"
};

async function main() {
    for (const [name, url] of Object.entries(screens)) {
        console.log(`Downloading ${name}...`);
        const res = await fetch(url);
        const html = await res.text();
        await fs.writeFile(`stitch_${name}.html`, html, 'utf-8');
        console.log(`Saved stitch_${name}.html (${html.length} bytes)`);
    }
}

main().catch(console.error);
