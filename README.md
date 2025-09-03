Overview:
This backend service enables the operator stylr natural language wuery to be mapped to tables or images from a control valve manual. it processes two key input files

Features:
    Returns images/tables with repcies page and bounding box citations 
    Confidence scoring and fallback for ambigious queries
    
How to run the repository:
    After cloning : npm i
    node server.js
    now in the forntend go to the index.html open using the browser and you can put the query in there only
Depedencies:
    express
    cors
    markdown-it
    natural
