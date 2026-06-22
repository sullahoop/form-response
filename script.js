import WordCloud from "wordcloud";
import { Garu } from "garu-ko";

const stopPos = new Set(["Josa", "Eomi", "Punctuation", "Determiner"]);
const stopwords = new Set(["그리고", "하지만", "입니다", "있는", "없는", "하기"]);

async function readCsvFile(file) {
    const text = await file.text();

    // 단순 CSV 파서: 따옴표/콤마 기본 처리
    return text
        .split(/\r?\n/)
        .filter(Boolean)
        .map(line => parseCsvLine(line));
}

function parseCsvLine(line) {
    const result = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            result.push(cell);
            cell = "";
        } else {
            cell += ch;
        }
    }

    result.push(cell);
    return result;
}

async function extractKeywordsFromCsv(file) {
    const rows = await readCsvFile(file);
    const text = rows.flat().join(" ");

    const garu = await Garu.load();
    const tokens = garu.analyze(text);

    const freq = {};

    for (const token of tokens) {
        const word = token.surface;
        const pos = token.pos;

        if (
            word.length < 2 ||
            stopwords.has(word) ||
            stopPos.has(pos) ||
            /^\d+$/.test(word)
        ) continue;

        freq[word] = (freq[word] || 0) + 1;
    }

    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100);
}

document.querySelector("#csvFile").addEventListener("change", async e => {
    const file = e.target.files[0];
    const keywords = await extractKeywordsFromCsv(file);

    WordCloud(document.querySelector("#wordCloud"), {
        list: keywords,
        gridSize: 12,
        weightFactor: 8,
        fontFamily: "Arial",
        backgroundColor: "#fff"
    });
});