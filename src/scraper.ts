import { RoyalRoadAPI } from "./lib";
import { writeFile } from "fs/promises";
import pLimit from "p-limit";

const api = new RoyalRoadAPI();

// Read command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.log("Usage: node scraper.js <fictionId> <outputFile>");
    process.exit(1);
}

(async () => {
    const fictionId = parseInt(args[0]);
    const outputFile = args[1];

    // Enforce fictionId to be a number
    if (isNaN(fictionId)) {
        console.log("Fiction ID must be a number");
        process.exit(1);
    }

    console.log(`Scraping fiction ${fictionId} to ${outputFile}`);

    const promiseLimit = pLimit(5);
    const elydes = await api.fiction.getFiction(fictionId)
    // Get chapters
    const chapters = await Promise.all(elydes.data.chapters.map(async (chap) => {
        return promiseLimit(() => api.chapter.getChapter(chap.id))
    }))
    const data = elydes.data.chapters.map((chap, i) => {
        return {
            title: chap.title,
            content: chapters[i].data.content,
            id: chap.id
        }
    })
    // Save fiction to json
    const jsonData = JSON.stringify(data, null, 2)
    // Write to file
    await writeFile(outputFile, jsonData)
    
})().catch(console.error);