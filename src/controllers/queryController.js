import fs from "fs";
import { FILES } from "../../config/index.js";
import { searchQuery, retrieveCandidates } from "../retriever/retriever.js";
import { formatResults } from "../formatter/formatter.js";

export function handleQuery(req, res) {
  const query = req.body.query;
  const manualData = loadManualData(); 

  const candidates = retrieveCandidates(query, manualData);

  if (candidates.length === 0 || candidates[0].score < 0.05) {
    return res.json({ result: "insufficient_info" });
  }

  const results = candidates.map((c) => ({
    image_url: c.image_url,
    page_no: c.page_no,
    bounding_box: c.bounding_box,
    caption: c.caption,
    context: c.context,
    score: c.score,
  }));

  res.json({ results });
}

function loadManualData() {
  try {
    const metadataRaw = fs.readFileSync(FILES.metadata, "utf-8");
    const metadata = JSON.parse(metadataRaw);

    
    const manualData = Array.isArray(metadata.pages) ? metadata.pages : [];

   
    if (manualData.length > 0) {
      console.log("[controller] Sample item:", manualData[0]);
    } else {
      console.warn("[controller] manualData is empty.");
    }
    return manualData;
  } catch (err) {
    console.error(" [controller] Error loading manualData:", err);
    return [];
  }
}
