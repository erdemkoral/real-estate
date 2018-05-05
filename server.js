const http = require('http');
const app = require('./lib/app');
const connect = require('./lib/connect');
connect();
// const mongoose = require('mongoose');
// const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate';
// mongoose.connect(DB_URI);

const server = http.createServer(app);

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log('server is running on', server.address().port);
});