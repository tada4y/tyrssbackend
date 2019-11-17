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

const findUser = (name, pass) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users WHERE name = '" 
            + name + "' AND password = '" + pass + "' LIMIT 1;";
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

module.exports = {
    users,
    findUser,
    updateToken,
};