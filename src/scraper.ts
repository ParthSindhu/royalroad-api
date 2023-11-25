import { RoyalRoadAPI } from "./lib";
import { writeFile } from "fs/promises";
import pLimit from "p-limit";

const api = new RoyalRoadAPI();

(async () => {
    const promiseLimit = pLimit(5);
    // Get fiction https://www.royalroad.com/fiction/67742/elydes
    const elydes = await api.fiction.getFiction(67742)
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
    await writeFile("./elydes.json", jsonData)
    
})().catch(console.error);