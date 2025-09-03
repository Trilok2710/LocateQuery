import fs from "fs";
import MarkdownIt from "markdown-it";
import { FILES } from "../../config/index.js";

const md = new MarkdownIt();


function extractCaption(raw) {
  const match = raw.match(/\\caption\{([^}]*)\}/);
  return match ? match[1] : "";
}

function cleanText(raw) {
   // remove LaTeX 
  return raw
    .replace(/\\[a-zA-Z]+/g, " ")  
    .replace(/\$[^$]*\$/g, " ")    
    .replace(/[{}&%_|]/g, " ")     
    .replace(/\!\[.*?\]\(.*?\)/g, " ") 
    .replace(/\s+/g, " ")          
    .trim();
}


export function parseManual() {
 

  if (!fs.existsSync(FILES.manual)) {
    console.error("[parser] manual.mmd file not found!");
    return [];
  }

  const content = fs.readFileSync(FILES.manual, "utf-8");


  const tokens = md.parse(content, {});
 

  let items = [];

  tokens.forEach((t, i) => {
    if (t.type === "inline") {

      if (t.content.includes("![")) {

        items.push({
          type: "image",
          raw: t.content,
          caption: tokens[i + 1]?.content || cleanText(t.content)
        });
      }
   
      else if (t.content.includes("\\begin{table}")) {
        const caption = extractCaption(t.content);
        
        items.push({
          type: "table",
          raw: cleanText(t.content),
          caption: caption || cleanText(t.content)
        });
      }

      else if (t.content.includes("|") && t.content.includes("-")) {
 
        items.push({
          type: "table",
          raw: cleanText(t.content),
          caption: tokens[i - 1]?.content || ""
        });
      }
    }
  });

  return items;
}


export function parseMetadata() {


  if (!fs.existsSync(FILES.metadata)) {
    console.error("[parser] mmd_lines_data.json file not found!");
    return {};
  }

  const raw = fs.readFileSync(FILES.metadata, "utf-8");
  const data = JSON.parse(raw);

  
  return data;
}
