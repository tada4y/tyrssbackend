const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString
});

const app = express()
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    pool.query('SELECT * FROM users', (err, resp) => {
        if (err) {
            res.status(500).send('internal error');
        } else {
            res.send(JSON.stringify(resp.rows));
        }
    });
});

app.listen(port, () => {
    console.log('server start on', port);
});