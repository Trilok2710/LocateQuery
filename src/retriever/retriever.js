import { buildIndex } from "../indexer/indexer.js";
import { stringSimilarity, semanticSimilarity, expandQuery } from "../utils/similarity.js";
import { CONFIDENCE_THRESHOLD } from "../../config/index.js";

const index = buildIndex();

export function searchQuery(query) {

  let results = [];

  index.forEach(item => {
    const textForSearch = `${item.caption} ${item.raw}`;
    const score = stringSimilarity(query, textForSearch);


    if (score > 0) {
      results.push({
        ...item,
        confidence: score
      });
    }
  });

  results.sort((a, b) => b.confidence - a.confidence);

  if (results.length === 0) {
    return { status: "insufficient_info" };
  }

  if (results[0].confidence < CONFIDENCE_THRESHOLD) {
    return { status: "insufficient_info" };
  }

  return { results: results.slice(0, 3) };
}

export function retrieveCandidates(query, manualData) {
  if (!Array.isArray(manualData)) {
    return [];
  }

  const queries = expandQuery(query);
  let candidates = [];


  manualData.forEach(item => {
    const itemText = Array.isArray(item.lines)
      ? item.lines.map(line => line.text).join(' ')
      : '';

    queries.forEach(q => {
      const semScore = semanticSimilarity(q, itemText);
      const fuzzyScore = stringSimilarity(q, itemText);
      const score = 0.7 * semScore + 0.3 * fuzzyScore;

      // Try to extract image URL and caption
      let imageUrl = null;
      let caption = null;
      if (Array.isArray(item.lines)) {
        item.lines.forEach(line => {
          const imgMatch = line.text.match(/https?:\/\/[^\s\}]+/);
          if (imgMatch) imageUrl = imgMatch[0];
          const capMatch = line.text.match(/\\caption\{([^}]+)\}/);
          if (capMatch) caption = capMatch[1];
        });
      }

      if (score > 0.01 && imageUrl) {
        candidates.push({
          image_url: imageUrl,
          page_no: item.page,
          bounding_box: item.lines[0]?.region || null,
          caption: caption,
          context: itemText,
          score
        });
      }
    });
  });

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
  }

  return candidates.slice(0, 5);
}

function extractContext(item) {
  return item.text; 
}
