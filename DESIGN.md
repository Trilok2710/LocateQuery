# DESIGN.md

## Overview
This backend service enables **operator-style natural queries** (e.g., *“Show me the sizing factors for liquids”*) to be mapped to **tables or images** from the control valve manual. The service processes two key input files:

1. **manual.mmd** → textual content (tables in Markdown, images as links with captions).
2. **mmd_lines_data.json** → layout metadata (pages, bounding boxes, coordinates).

The service returns matched content with **citation info**:
- `page_no`
- `bounding_box` (coordinates of the item on the page)
- `confidence` score for relevance

If the match is unclear or confidence is low, it returns `"insufficient_info"` or the top candidates ranked by relevance.

## Architecture

### 1. Server Layer
- **File**: `server.js`
- **Purpose**: Sets up an Express server to handle API requests, enabling CORS and JSON parsing.
- **Key Features**:
  - Listens on a configurable port (via `config/index.js`).
  - Routes `/query` requests to `queryRoutes` for processing.
  - Includes a health check endpoint (`/`) returning "server is up".
- **Why?**: Provides a RESTful API entry point, ensuring scalability and accessibility.

### 2. Indexing Layer
- **File**: `indexer.js`
- **Purpose**: Builds an in-memory index by parsing `manual.mmd` and `mmd_lines_data.json`.
- **Process**:
  - Uses `parseManual()` to extract tables, images, and captions from Markdown.
  - Uses `parseMetadata()` to map items to page numbers and bounding boxes.
  - Creates an indexed array with `id`, `page`, and `bounding_box` for each item.
- **Why?**: Enables efficient retrieval by pre-processing content and metadata, reducing runtime search overhead.

### 3. Parsing Layer
- **File**: `parser.js`
- **Purpose**: Handles raw file parsing for indexing.
- **Key Functions**:
  - `parseManual()`: Extracts content using Markdown-it, identifying images (`![...]`) and tables (`\begin{table}` or `|...-...|` syntax), cleaning text of LaTeX and special characters.
  - `parseMetadata()`: Loads and parses `mmd_lines_data.json` for layout data.
- **Why?**: Ensures robust extraction of structured and unstructured data from source files.

### 4. Retrieval Layer
- **File**: `retriever.js`
- **Purpose**: Matches user queries to indexed content using similarity scoring.
- **Process**:
  - `searchQuery()`: Initial search with string similarity, returning top 3 results or `"insufficient_info"` if confidence < threshold.
  - `retrieveCandidates()`: Expands queries with synonyms, computes combined (semantic + fuzzy) scores, and returns top 5 candidates with `image_url`, `page_no`, `bounding_box`, `caption`, `context`, and `score`.
- **Dependencies**: Uses `similarity.js` for scoring and `expandQuery` for query expansion.
- **Why?**: Handles natural language queries with semantic understanding, improving match accuracy.

### 5. Similarity Layer
- **File**: `similarity.js`
- **Purpose**: Computes relevance scores between queries and candidate text.
- **Key Functions**:
  - `stringSimilarity()`: Blends Jaccard index, cosine similarity (TF-IDF), and substring bonus.
  - `semanticSimilarity()`: Uses stemmed word overlap for deeper semantic matching.
  - `expandQuery()`: Expands queries with synonyms (e.g., "drawing" → ["figure", "diagram"]).
- **Why?**: Enhances query matching by considering both exact and conceptual similarities.

### 6. Controller Layer
- **File**: `querycontroller.js`
- **Purpose**: Orchestrates query handling and response generation.
- **Process**:
  - `handleQuery()`: Loads manual data, retrieves candidates, filters by score (> 0.05), and formats results.
  - Integrates `loadManualData()` to read `mmd_lines_data.json`.
- **Why?**: Centralizes business logic, ensuring consistent data flow from retrieval to response.

### 7. Formatting Layer
- **File**: `formatter.js`
- **Purpose**: Structures the final JSON response.
- **Process**:
  - `formatResults()`: Transforms raw results into a standardized format with `type`, `content`, `caption`, `citation`, and `confidence`.
  - Handles `"insufficient_info"` cases directly.
- **Why?**: Ensures a uniform API output, making it easy for clients to consume.

## Example Queries and Responses

1. **Query**: “Show me the overall oil & gas value chain diagram.”  
   **Response**:  
   ```json
   {
    "results": [
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-127.jpg?height=269&width=790&top_left_y=688&top_left_x=1151",
            "page_no": 127,
            "bounding_box": {
                "top_left_x": 1610,
                "top_left_y": 341,
                "width": 315,
                "height": 69
            },
            "caption": "Figure 10-1. Gas Transportation Process Flow Diagram",
            "score": 0.12328316954565284
        },
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-004.jpg?height=1169&width=1240&top_left_y=1116&top_left_x=479)",
            "page_no": 4,
            "bounding_box": {
                "top_left_x": 1634,
                "top_left_y": 477,
                "width": 304,
                "height": 74
            },
            "caption": null,
            "score": 0.0831019377389608
        },
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-128.jpg?height=278&width=790&top_left_y=273&top_left_x=1151",
            "page_no": 128,
            "bounding_box": {
                "top_left_x": 246,
                "top_left_y": 276,
                "width": 755,
                "height": 42
            },
            "caption": "Table 10-1. Worker Valve",
            "score": 0.07909427155289506
        }
    ]
   }


2. **Query**: “Can you pull up the comparison of actuator types?”  
   **Response**:  
   ```json
   {
    "results": [
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-030.jpg?height=646&width=432&top_left_y=281&top_left_x=1311",
            "page_no": 30,
            "bounding_box": {
                "top_left_x": 265,
                "top_left_y": 287,
                "width": 736,
                "height": 424
            },
            "caption": "Figure 2-5. Spring fail-safe is present in this piston design. The 585C actuator is an example of a spring-bias piston actuator. Process pressure can aid fail-safe action, or the actuator can be configured for full spring-fail closure.",
            "score": 0.053943285710483804
        },
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-032.jpg?height=665&width=636&top_left_y=287&top_left_x=273",
            "page_no": 32,
            "bounding_box": {
                "top_left_x": 273,
                "top_left_y": 287,
                "width": 636,
                "height": 665
            },
            "caption": "Figure 2-8. Fisher D4 Control Valve with easy-Drive Electric Actuator",
            "score": 0.05217135989286453
        },
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-031.jpg?height=876&width=524&top_left_y=287&top_left_x=1263",
            "page_no": 31,
            "bounding_box": {
                "top_left_x": 436,
                "top_left_y": 295,
                "width": 413,
                "height": 700
            },
            "caption": "Figure 2-7. Since the requirements for accuracy and minimal lost motion are unnecessary for on-off service, cost savings can be achieved by simplifying the actuator design. The 1066SR incorporates spring-return capability.",
            "score": 0.041732490565556335
        }
    ]
   }


3. **Query**: “Do we have a figure that explains cavitation?”  
   **Response**:  
   ```json
   {
    "results": [
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-069.jpg?height=1099&width=470&top_left_y=284&top_left_x=352",
            "page_no": 69,
            "bounding_box": {
                "top_left_x": 352,
                "top_left_y": 284,
                "width": 470,
                "height": 1099
            },
            "caption": "Figure 6-12. Cavitrol IV trim provides cavitation protection at pressures to 6500 psig. It uses expanding flow areas to affect a four-stage pressure drop. All significant pressure drop is taken downstream of the shutoff seating surface.",
            "score": 0.07717945834679453
        },
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-061.jpg?height=768&width=695&top_left_y=975&top_left_x=279",
            "page_no": 61,
            "bounding_box": {
                "top_left_x": 284,
                "top_left_y": 303,
                "width": 662,
                "height": 459
            },
            "caption": "Figure 6-2. Pressure versus velocity curves illustrate that the highest flow rate occurs at the vena contracta.",
            "score": 0.07417503442091379
        },
        {
            "image_url": "https://cdn.mathpix.com/cropped/2025_08_28_14c222ac7973e4f89cc8g-068.jpg?height=646&width=719&top_left_y=276&top_left_x=271",
            "page_no": 68,
            "bounding_box": {
                "top_left_x": 271,
                "top_left_y": 276,
                "width": 719,
                "height": 646
            },
            "caption": "Figure 6-11. By combining the geometric effects of thick plates and thin plates, it is possible to design a flow passage that optimizes capacity and recovery coefficient values. These carefully designed passages are used exclusively in Cavitrol cages.",
            "score": 0.06746456054260386
        }
    ]
   }