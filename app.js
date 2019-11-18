require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const xmljs = require('xml-js');

const app = express();
const port = process.env.PORT || 3000;

const whiteList = [
    'http://localhost:3000', 
    'http://localhost:8080',
    'https://happy-sinoussi-e9fac6.netlify.com'
];
const corsOpts = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOpts));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello');
});

/*app.get('/users', (req, res) => {
    return db.users().then((resp) => {
        res.send(JSON.stringify(resp));
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});*/

/*app.post('/user', (req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;
    return db.findUser(name, pass).then((resp) => {
        res.send(JSON.stringify(resp));
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});*/

app.post('/login', (req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;
    return db.findUser(name).then((resp) => {
        if (resp.length > 0) {
            if (bcrypt.compareSync(pass, resp[0].password)) {
                return db.updateToken(resp[0].id);
            } else {
                throw new Error('password invalid');
            }
        } else {
            throw new Error('user not found');
        }
    }).then((resp) => {
        res.send(resp);
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});

app.post('/rss', (req, res) => {
    const token = req.body.token;
    const url = req.body.url;
    return db.checkToken(token).then((resp) => {
        if (resp) {
            return axios.get(url);
        } else {
            res.status(400).send('token invalid');
        }
    }).then((resp) => {
        const json = xmljs.xml2json(resp.data, {compact: true});
        res.send(json);
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});

app.listen(port, () => {
    console.log('server start on', port);
});