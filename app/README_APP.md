Run locally:
1. cd app
2. npm install
3. PORT=3000 VISITS_TABLE=VisitsTable node server.js
Open http://localhost:3000/

NOTE: Local run will try to use your AWS credentials to access DynamoDB named 'VisitsTable' in default region.
To run locally without DynamoDB, comment out increment/get calls and return a static JSON for demo.
