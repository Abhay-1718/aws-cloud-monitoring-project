// server.js
const http = require('http');
const os = require('os');
const AWS = require('aws-sdk');

const region = process.env.AWS_REGION || 'us-east-1';
AWS.config.update({ region });

const dynamodb = new AWS.DynamoDB();
const TABLE = process.env.VISITS_TABLE || 'VisitsTable';
const port = process.env.PORT || 80;

async function incrementVisit(path){
  const params = {
    TableName: TABLE,
    Key: { path: { S: path } },
    UpdateExpression: 'ADD visit_count :inc',
    ExpressionAttributeValues: { ':inc': { N: '1' } },
    ReturnValues: 'UPDATED_NEW'
  };
  return dynamodb.updateItem(params).promise();
}

async function getVisitCount(path){
  const params = { TableName: TABLE, Key: { path: { S: path } } };
  const res = await dynamodb.getItem(params).promise();
  if(!res.Item || !res.Item.visit_count) return 0;
  return Number(res.Item.visit_count.N);
}

const server = http.createServer(async (req,res)=>{
  if(req.url === '/health'){
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('OK\n');
    return;
  }
  try{
    await incrementVisit(req.url);
    const count = await getVisitCount(req.url);
    const data = {
      hostname: os.hostname(),
      uptime_seconds: Math.floor(os.uptime()),
      loadavg: os.loadavg(),
      path: req.url,
      visits: count,
      timestamp: new Date().toISOString()
    };
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify(data));
  }catch(e){
    res.writeHead(500,{'Content-Type':'application/json'});
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(port, () => console.log(`Server listening on ${port}`));
