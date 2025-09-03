import { parseManual, parseMetadata } from "./parser.js";

export function buildIndex() {

  const manualItems = parseManual();
  const metadata = parseMetadata();

  if (manualItems.length === 0) {
    console.warn("[indexer] No manual items found!");
  }

  
  const indexed = manualItems.map((item, idx) => ({
    ...item,
    id: idx,
    page: metadata.pages?.[idx]?.page || null,
    bounding_box: metadata.pages?.[idx]?.region || null
  }));

  return indexed;
}
