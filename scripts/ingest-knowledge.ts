import fs from 'fs';
import path from 'path';

// CONFIG
const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || 'https://data-service-stage.wjs-78d.workers.dev/api/internal/ingest';
const TRANSCRIPTS_DIR = path.join(process.cwd(), 'packages/transcripts');
const CURRENT_PHASE = 'research'; // We assume these transcripts are for research phase for now

async function main() {
    console.log(`Scanning for transcripts in ${TRANSCRIPTS_DIR}...`);

    // Check if directory exists
    if (!fs.existsSync(TRANSCRIPTS_DIR)) {
        console.error(`Directory not found: ${TRANSCRIPTS_DIR}`);
        return;
    }

    const targetFile = 'combined_1-61.md';
    const filePath = path.join(TRANSCRIPTS_DIR, targetFile);

    if (!fs.existsSync(filePath)) {
        console.error(`Target file not found: ${targetFile}`);
        return;
    }

    console.log(`Processing consolidated file: ${targetFile}...`);
    const content = fs.readFileSync(filePath, 'utf-8');

    // chunking strategy: split by paragraphs, group into chunks of ~1000 chars
    const chunks = chunkText(content, 1000);

    // Batch the requests to avoid timeout/large payload
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        console.log(`Sending batch ${i / batchSize + 1} / ${Math.ceil(chunks.length / batchSize)}...`);

        const items = batch.map(chunk => ({
            text: chunk,
            phase: CURRENT_PHASE,
            source: targetFile
        }));

        // Send to API
        try {
            const response = await fetch(DATA_SERVICE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`API Error: ${response.status} ${text}`);
            }

            const result = await response.json();
            console.log(`  -> Batch success.`);

        } catch (error) {
            console.error(`  -> Failed to ingest batch:`, error);
        }
    }
}

function chunkText(text: string, maxSize: number): string[] {
    // Simple splitting by double newline to preserve paragraph structure
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
        if (currentChunk.length + para.length > maxSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
        currentChunk += para + "\n\n";
    }
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

main().catch(console.error);
