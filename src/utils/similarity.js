import natural from "natural";

const tokenizer = new natural.WordTokenizer();

const synonyms = {
  drawing: ['figure', 'diagram', 'image', 'sketch'],
  table: ['chart', 'matrix', 'grid'],
};

function expandQuery(query) {
  let expanded = [query];
  Object.keys(synonyms).forEach(key => {
    if (query.includes(key)) {
      expanded = expanded.concat(synonyms[key].map(s => query.replace(key, s)));
    }
  });
  return expanded;
}

function stringSimilarity(query, candidate) {
  if (!query || !candidate) return 0;

  // Lowercase + tokenize
  const wordsQ = tokenizer.tokenize(query.toLowerCase());
  const wordsC = tokenizer.tokenize(candidate.toLowerCase());

  const setQ = new Set(wordsQ);
  const setC = new Set(wordsC);

  // Word overlap ratio
  let overlap = 0;
  setQ.forEach(w => {
    if (setC.has(w)) overlap++;
  });
  const jaccard = overlap / (setQ.size + setC.size - overlap);

  // Substring bonus
  let substring = 0;
  if (candidate.toLowerCase().includes(query.toLowerCase())) {
    substring = 1;
  }

  // Cosine similarity (TF-IDF style)
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(candidate.toLowerCase());
  const cosine = tfidf.tfidf(query.toLowerCase(), 0) / wordsQ.length;

  // Final blended score
  const score = (0.5 * jaccard) + (0.3 * cosine) + (0.2 * substring);


  return score;
}

function semanticSimilarity(query, candidate) {
  if (!query || !candidate) return 0;

  const stemmer = natural.PorterStemmer;
  const queryTokens = tokenizer.tokenize(query.toLowerCase()).map(stemmer.stem);
  const candidateTokens = tokenizer.tokenize(candidate.toLowerCase()).map(stemmer.stem);

  const setQ = new Set(queryTokens);
  const setC = new Set(candidateTokens);
  let overlap = 0;
  setQ.forEach(w => {
    if (setC.has(w)) overlap++;
  });
  return overlap / (setQ.size + setC.size - overlap);
}

export { stringSimilarity, semanticSimilarity, expandQuery };
