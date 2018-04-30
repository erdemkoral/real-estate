const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const errorHandler = require('./utils/error-handler');
// const checkAuth = require('./utils/check-auth')();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('./public'));

const auth = require('./routes/auth');
const listings = require('./routes/listings');
app.use('/api/auth', auth);
app.use('/api/listings', listings);

app.use(errorHandler());
module.exports = app;
