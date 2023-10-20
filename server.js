const express = require('express');
const app = express();
const port = 3001;
const budget = require('./src/HomePage/budget.json');
const cors = require('cors');

app.use(cors());

app.get('/budget', (req, res) => {
    res.json(budget);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});