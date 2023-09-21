import OpenAI from "openai";
import fs from "fs";
const { XMLParser } = require("fast-xml-parser");

let rss_feeds = [
    "https://www.lemonde.fr/en/international/rss_full.xml",
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.theguardian.com/world/rss",
    "https://www.huffpost.com/section/world-news/feed"
];

async function getSummarize() {
    let summarize = [];
    for (var i = 0; i < rss_feeds.length; i++) {
        let mediaSum = [];
        let url = rss_feeds[i];
        const response = await fetch(url);
        let xmlTxt = await response.text();
        const parser = new XMLParser();
        let jObj = parser.parse(xmlTxt);
        for (var j = 0; j < jObj.rss.channel.item.length; j++) {
            let value = jObj.rss.channel.item[j];
            if (Date.now() - Date.parse(value.pubDate) < 86400000) {
                mediaSum.push(value.title + " " + value.description);
            }
        }
        summarize.push(mediaSum);
    }
    return summarize;
}

let summarize = await getSummarize();

// get smallest list
let minLenght = summarize[0].length;
for (var x = 0; x < summarize.length; x++) {
    if (summarize[x].length < minLenght) {
        minLenght = summarize[x].length;
    }
}

// put all strings in one
let sumStr = "";
for (var y = 0; y < minLenght; y++) {
    sumStr += y + ". ";
    for (var z = 0; z < summarize.length; z++) {
        sumStr += summarize[z][y] + " ";
    }
}

console.log(sumStr);

const openai = new OpenAI({
    organization: "org-7DGwNZhb6Yv6fMG20lxwYyym",
    apiKey: "",
});

async function main() {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an assistant that will list news based on multiple titles and descriptions. Build the ranking based on the number of occurences. The first ones to appear in the input text should be prioritized in the output ranking." },
        { role: "user", content: "Tell me the 10 most important news of the day based on the following titles and descriptions. " + sumStr },
    ],
      model: "gpt-3.5-turbo-16k",
    });
  
    console.log(completion.choices[0]);
}
  
main();