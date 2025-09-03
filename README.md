Control Valve Manual Query Service

This backend service enables natural language queries to be mapped to tables or images from a control valve manual.
It processes two key input files and returns results with rich metadata.

✨ Features

🔍 Natural Language Querying → Map operator queries to manual content.

📑 Tables & Images Retrieval → Returns relevant tables/images with page references.

🗂 Bounding Box Citations → Precise citations for extracted content.

📊 Confidence Scoring → Each result includes a confidence score.

🛡 Fallback Handling → Gracefully manages ambiguous queries.

🚀 Getting Started
1. Clone the repository
git clone <your-repo-url>
cd <your-repo-folder>

2. Install dependencies
npm install

3. Start the server
node server.js


The API will be running locally on the configured port (default: http://localhost:3000).

🖥 Frontend Usage

Open index.html in your browser.

Enter a query in the input box.

The system will return the most relevant tables/images from the manual with citations.

📦 Dependencies

express
 → Fast, minimal web framework for Node.js

cors
 → Enable cross-origin requests

markdown-it
 → Markdown parser for rendering manual content

natural
 → Natural language processing library
