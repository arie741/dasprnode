const Pool = require('pg').Pool

const pool = new Pool({
  user: 'daspr',
  host: 'localhost',
  database: 'daspr',
  password: 'daspr2000',
  port: 5432
});

const getPwd = 'SELECT * FROM admin';
const countPublications = 'select count(*) from publication'
const getPublications = 'SELECT * FROM publication order by year DESC limit $1 offset $2';
const addPublication = "insert into publication (title, year, author, category, publisher, link, country, uuid) values ($1, $2, $3, $4, $5, $6, $7, $8)"
const editPublication = "update publication set title = $1, year = $2, author = $3, category = $4, publisher = $5, link = $6, country = $7 where uuid = $8"
const searchPublication = "SELECT * FROM publication WHERE title LIKE '%' || $1 || '%'"
const findPublicationByUuid = "SELECT * FROM publication where uuid=$1"
const deletePublication = 'delete from publication where uuid = $1'
const addImage = 'insert into sliderimages (filename, forder, uuid) values ($1, $2, $3)'
const findSliderImages = 'select * from sliderimages order by forder ASC'
const deleteSliderImage = "delete from sliderimages where filename=$1"

module.exports = {
	query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  getPwd,
  getPublications,
  addPublication,
  findPublicationByUuid,
  editPublication,
  deletePublication,
  countPublications,
  searchPublication,
  addImage,
  findSliderImages,
  deleteSliderImage
}