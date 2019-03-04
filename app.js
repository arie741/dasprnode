const express = require('express');
const ExpressSessions = require('express-session'); 
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const db = require('./db');

var pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

var pgPool = new pg.Pool({
  user: 'webbetac_daspr',
  host: 'localhost',
  database: 'webbetac_dasprdb',
  password: 'daspr2000',
  port: 5432
});  

var session;
const app = express();
const port = 62542;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(expressValidator());
app.use("/", express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(ExpressSessions({
	store: new pgSession({
	    pool : pgPool,                // Connection pool
	    tableName : 'session'   // Use another table-name than the default "session" one
  	}),
  	secret: 'dasprsecretkey31155%as22354',
  	resave: false,
  	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
	saveUninitialized:false
}));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

//Routes

app.get('/', function(req, res){
	res.render('home', { title: 'Home'});
})

app.get('/aboutus', function(req, res){
	res.render('about', { title: 'About Us'});
})

app.get('/collabp', function(req, res){
	res.render('collabp', { title: 'Collaboration & Partner'});
})

app.get('/admin', function(req, res){
	if(req.session.uniqueId){
		res.redirect('/admin-home');
	} else {
		res.render('admin', { title: 'Admin',  errors: req.session.errors});
		req.session.errors=null;
	}	
})

app.get('/admin-home', function(req, res){
	if(req.session.uniqueId){
		res.render('admin-home', { title: 'Admin'});
	} else {
		res.redirect('/admin');
	}
})

app.get('/admin-publication', function(req,res,next){
	if(req.session.uniqueId){
		res.redirect('/admin-publication/1');	
	} else {
		res.redirect('/admin');
	}
})

app.get('/admin-publication/:page', function(req,res,next){
	if(req.session.uniqueId){
		var pagLength = 0;
		db.query(db.countPublications, [], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    var arr = resp.rows;
		    pagLength = Math.ceil(arr[0].count / 10);	
  		})

		db.query(db.getPublications, [(req.params.page * 10), ((req.params.page - 1) * 10)], (err, resp) => {
		    if (err) {
		      return next(err)
		    }

	    	res.render('admin-publication', { title: 'Admin', publications: resp.rows, pages: pagLength, currentpage: req.params.page });
  		})		
	} else {
		res.redirect('/admin');
	}
})

app.post('/admin-publication-search-request', function(req, res, next){
	if(req.session.uniqueId){
		var pagLength = 0;

		db.query(db.searchPublication, [req.body.pSearch], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.render('admin-publication', { title: 'Admin', publications: resp.rows, pages: pagLength, currentpage: 1 });
  		})
	} else {
		res.redirect('/admin');
	}
})

app.get('/pub-add', function(req,res){
	if(req.session.uniqueId){
		res.render('pub-add', { title: 'Add Publications'});	
	} else {
		res.redirect('/admin');
	}
})

app.get('/pub-edit/:uuid', function(req,res,next){
	if(req.session.uniqueId){
		db.query(db.findPublicationByUuid, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
	    	res.render('edit-publication', { title: 'Edit Publication', publications: resp.rows});
  		})	
	} else {
		res.redirect('/admin');
	}
})

app.post('/pub-add-request', function(req,res,next){
	if(req.session.uniqueId){
		var uuid = require('uuid/v1');
		db.query(db.addPublication, [req.body.pTitle, req.body.pYear, req.body.pAuthor, req.body.pCategory, req.body.pPublisher, req.body.pLink, req.body.pCountry, uuid()], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.redirect('/admin-publication');	
  		})
	} else {
		res.redirect('/admin');
	}
})

app.post('/pub-edit-request/:uuid', function(req,res,next){
	if(req.session.uniqueId){
		db.query(db.editPublication, [req.body.pTitle, req.body.pYear, req.body.pAuthor, req.body.pCategory, req.body.pPublisher, req.body.pLink, req.body.pCountry, req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.redirect('/admin-publication');	
  		})
	} else {
		res.redirect('/admin');
	}
})

app.get('/pub-delete-request/:uuid', function(req,res,next){
	if(req.session.uniqueId){
		db.query(db.deletePublication, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.redirect('/admin-publication');	
  		})
	} else {
		res.redirect('/admin');
	}
})



app.get('/logout', function(req, res){
	req.session.destroy(function(err){
		res.redirect('/admin');
	})
})

app.post('/login-request', function(req, res, next){
	db.query(db.getPwd, [], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
    	req.check('pwd', 'Wrong password!').equals(resp.rows[0].pwd);
		var errors = req.validationErrors();
		if(errors){
			req.session.errors=errors;
			res.render('admin', { title: 'Admin', errors: req.session.errors});
		} else {
			req.session.uniqueId = 'admindaspr';
			res.redirect('/admin-home');
		}
  	})
	
})