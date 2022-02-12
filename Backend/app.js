const express = require('express');
const cors = require('cors');

const db = require('./db/db');

const spaceRouter = require('./routes/routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(spaceRouter);

db.init();

module.exports = app;
