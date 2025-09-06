//backend/store.js
const fs = require("fs").promises;
const path = require("path");
const DB_PATH = path.join(__dirname, "db.json");

async function readDb(){
    try {
        const txt = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(txt);
    }catch (e) {
        if (e.code === "ENOENT") {
            const empty = { posts: [] };
            await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2));
            return empty;
        }
        throw e;
    }
}
async function writeDb(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data,null,2));
}
module.exports = { readDb, writeDb, DB_PATH};







