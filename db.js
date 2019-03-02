const Pool = require('pg').Pool
const pool = new Pool({
  user: 'daspr',
  host: 'localhost',
  database: 'daspr',
  password: 'daspr2000',
  port: 5432,
})

var getPwd = 'SELECT * FROM admin';
var getPublications = 'SELECT * FROM publication';
var addPublication = "insert into publication (title, year, author, category, publisher, link, country) values ($1, $2, $3, $4, $5, $6, $7)"

module.exports = {
	query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  getPwd,
  getPublications,
  addPublication
}