const Pool = require('pg').Pool
const pool = new Pool({
  user: 'daspr',
  host: 'localhost',
  database: 'daspr',
  password: 'daspr2000',
  port: 5432,
})

var getPwd = 'SELECT * FROM admin';

module.exports = {
	query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  getPwd
}