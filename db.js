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
const searchPublication = "SELECT * FROM publication WHERE lower(title) LIKE lower('%' || $1 || '%')"
const findPublicationByUuid = "SELECT * FROM publication where uuid=$1"
const deletePublication = 'delete from publication where uuid = $1'
const addImage = 'insert into sliderimages (filename, forder, uuid) values ($1, $2, $3)'
const findSliderImages = 'select * from sliderimages order by forder ASC'
const deleteSliderImage = "delete from sliderimages where filename=$1"
const addEvent = 'insert into newscontents (img, title, author, edate, contents, etype, entitle, encontents, uuid, dbdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)'
const findEvents = 'select * from newscontents order by edate DESC'
const findEvent = 'select * from newscontents where uuid=$1'
const editEvent = "update newscontents set img = $1, title = $2, author = $3, edate = $4, contents = $5, etype = $6, entitle = $7, encontents = $8 where uuid = $9"
const deleteEvent = 'delete from newscontents where uuid = $1'
const searchEvent = "SELECT * FROM newscontents WHERE lower(title) LIKE lower('%' || $1 || '%')"
const addTim = 'insert into timkami (foto, nama, jabatan, keterangan, overview, riset, publikasi, supervisi, enjabatan, enketerangan, enoverview, enriset, enpublikasi, ensupervisi, facebook, instagram, twitter, youtube, urutan, uuid) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)'
const findTimKami = 'select * from timkami order by urutan ASC'
const findTim = 'select * from timkami where uuid=$1'
const editTimKami = 'update timkami set foto = $1, nama = $2, jabatan = $3, keterangan = $4, overview = $5, riset = $6, publikasi = $7, supervisi = $8, enjabatan = $9, enketerangan = $10, enoverview = $11, enriset = $12, enpublikasi = $13, ensupervisi = $14, facebook = $15, instagram = $16, twitter = $17, youtube = $18, urutan = $19 where uuid = $20'
const deleteTim = 'delete from timkami where uuid = $1'
const searchTimKami = "select * from timkami where lower(nama) like lower('%' || $1 || '%')"
const getViewsCount = 'select * from viewscount'
const addViewsCount = 'update viewscount set count = ((select count from viewscount)+1) where count=(select count from viewscount)'

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
  deleteSliderImage,
  addEvent,
  findEvents,
  findEvent,
  editEvent,
  deleteEvent,
  searchEvent,
  addTim, 
  findTimKami,
  findTim,
  editTimKami,
  deleteTim,
  searchTimKami,
  getViewsCount,
  addViewsCount
}