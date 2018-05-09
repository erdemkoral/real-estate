const http = require('http');
const app = require('./lib/app');
const connect = require('./lib/connect');
connect();

const server = http.createServer(app);

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log('server is running on', server.address().port);
});