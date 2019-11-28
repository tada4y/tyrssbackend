const { Pool } = require('pg');
const hash = require('hash.js');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString
});

const users = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users', (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(resp.rows);
            }
        });
    });
};

const findUser = (name) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users WHERE name = '" 
            + name + "' LIMIT 1;";
        pool.query(query, (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(resp.rows);
            }
        });
    });
};

const updateToken = (id) => {
    return new Promise((resolve, reject) => {
        const time = Date.now();
        const token = hash.sha256().update(time.toString()).digest('hex');
        const query = "UPDATE users SET token = '" + token + "' WHERE id = " + id + ";";
        pool.query(query, (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

const checkToken = (token) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT token FROM users WHERE token = '" + token + "' LIMIT 1;";
        pool.query(query, (err, resp) => {
            if (err) {
                reject(err);
            } else if (resp.rows.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

const feeds = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM feeds;";
        pool.query(query, (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(resp.rows);
            }
        });
    });
};

const findFeed = (url) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM feeds WHERE url = '" + url + "' LIMIT 1;";
        pool.query(query, (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(resp.rows);
            }
        });
    });
};

const addFeed = (url, items) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO feeds (url, items) VALUES ('" + url + "', '" + items + "');";
        pool.query(query, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

const updateFeed = (url, items) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE feeds SET items = '" + items + "' WHERE url = '" + url + "';";
        pool.query(query, (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

module.exports = {
    users,
    findUser,
    updateToken,
    checkToken,
    feeds,
    findFeed,
    addFeed,
    updateFeed,
};