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

module.exports = {
    users,
    findUser,
    updateToken,
    checkToken,
};