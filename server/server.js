let express = require('express');
let http = require('http');

let app = express();
let clientDir = `${__dirname}/../client`;
app.use(express.static(clientDir));

let server = http.createServer(app);
server.listen(8888, ()=>{
    console.log('connected on 8888');
});