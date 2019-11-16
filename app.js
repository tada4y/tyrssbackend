require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello');
});

app.get('/users', (req, res) => {
    return db.users().then((resp) => {
        res.send(JSON.stringify(resp));
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });
});

app.post('/user', (req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;
    return db.findUser(name, pass).then((resp) => {
        res.send(JSON.stringify(resp));
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });
});

app.listen(port, () => {
    console.log('server start on', port);
});