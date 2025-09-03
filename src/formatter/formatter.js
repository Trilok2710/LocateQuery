export function formatResults(rawResults) {
  if (rawResults.status === "insufficient_info") {
    return rawResults;
  }

  return {
    results: rawResults.results.map(r => ({
      type: r.type,
      content: r.raw,
      caption: r.caption,
      citation: {
        page_no: r.page,
        bounding_box: r.bounding_box
      },
      confidence: r.confidence
    }))
  };
}
