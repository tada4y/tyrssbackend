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

const parseItems = (xml) => {
    let items = [];
    if (xml.rss !== undefined) {
        xml.rss.channel.item.map((e) => {
            items.push({
                channel: xml.rss.channel.title["_text"],
                title: e.title["_text"],
                link: e.link["_text"],
                date: new Date(e.pubDate["_text"]),
                desc: e.description ? e.description["_text"] : e.title["_text"],
            });
        });
    } else if (xml["rdf:RDF"] !== undefined) {
        xml["rdf:RDF"].item.map((e) => {
            items.push({
                channel: xml["rdf:RDF"].channel.title["_text"],
                title: e.title["_text"],
                link: e.link["_text"],
                date: new Date(e["dc:date"]["_text"]),
                desc: e.description ? e.description["_cdata"] || e.description["_text"] : e.title["_text"],
            });
        });
    }
    return items;
};

app.use(cors(corsOpts));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello');
});

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

app.get('/feed/update', (req, res) => {
    return db.feeds().then((resp) => {
        const tasks = resp.map((elm) => {
            return new Promise((resolve, reject) => {
                axios.get(elm.url).then((response) => {
                    const json = xmljs.xml2json(response.data, {compact: true});
                    const rss = parseItems(JSON.parse(json));
                    let items = [...JSON.parse(elm.items)];
                    rss.forEach((item) => {
                        const fltrd = items.filter(e => e.link === item.link);
                        if (fltrd.length === 0) items.unshift(item);
                    });
                    if (items.length > 200) {
                        items.splice(200);
                    }
                    return db.updateFeed(elm.url, JSON.stringify(items));
                }).then(() => {
                    resolve(true);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
        return Promise.all(tasks);
    }).then(() => {
        res.send('ok');
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});

app.post('/feed/add', (req, res) => {
    const token = req.body.token;
    const url = req.body.url;
    return db.checkToken(token).then((resp) => {
        if (resp) {
            return db.findFeed(url);
        } else {
            throw new Error('token invalid');
        }
    }).then((resp) => {
        if (resp.length === 0) {
            return db.addFeed(url, JSON.stringify([]));
        } else {
            throw new Error('url already exists');
        }
    }).then(() => {
        res.send('ok');
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});

app.post('/feed', (req, res) => {
    const token = req.body.token;
    const url = req.body.url;
    return db.checkToken(token).then((resp) => {
        if (resp) {
            return db.findFeed(url);
        } else {
            throw new Error('token invalid');
        }
    }).then((resp) => {
        res.send(JSON.stringify(resp[0].items));
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
    });
});

app.listen(port, () => {
    console.log('server start on', port);
});