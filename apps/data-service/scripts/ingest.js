const fs = require('fs');
const path = require('path');

const TRANSCRIPTS_FILE = path.resolve(__dirname, '../../../packages/transcripts/Research_Transcipts.txt');
// Update this URL to match your deployed worker or local dev
const API_URL = "https://data-service-stage.wjs-78d.workers.dev/api/internal/ingest";

function chunkText(text, maxLength = 1000) {
    const chunks = [];
    let currentChunk = "";

    // Split by loosely defined paragraphs or newlines to keep semantic chunks
    const paragraphs = text.split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length + 2 < maxLength) {
            currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        } else {
            // Push current chunk if not empty
            if (currentChunk) chunks.push(currentChunk);
            // Start new chunk with this paragraph
            currentChunk = paragraph;

            // If paragraph itself is too huge, hard split it (fallback)
            while (currentChunk.length > maxLength) {
                chunks.push(currentChunk.slice(0, maxLength));
                currentChunk = currentChunk.slice(maxLength);
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks;
}

async function main() {
    console.log(`Reading ${TRANSCRIPTS_FILE}...`);

    if (!fs.existsSync(TRANSCRIPTS_FILE)) {
        console.error(`File not found: ${TRANSCRIPTS_FILE}`);
        process.exit(1);
    }

    const content = fs.readFileSync(TRANSCRIPTS_FILE, 'utf-8');
    const chunks = chunkText(content);

    console.log(`Split content into ${chunks.length} chunks.`);

    const items = chunks.map((chunk, index) => ({
        text: chunk,
        phase: "research",
        source: "Research_Transcipts.txt"
    }));

    const BATCH_SIZE = 10;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        console.log(`Uploading batch ${(i / BATCH_SIZE) + 1}/${Math.ceil(items.length / BATCH_SIZE)}...`);

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: batch })
            });

            if (!res.ok) {
                console.error(`Error: ${res.status} ${res.statusText}`);
                const text = await res.text();
                console.error(text);
            } else {
                const data = await res.json();
                console.log(`Success: Batch saved. Count: ${data.count}`);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }
    console.log("Ingestion complete!");
}

main();
