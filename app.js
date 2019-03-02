const express = require('express');
const ExpressSessions = require('express-session'); 
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

var session;
const app = express();
const port = 3000;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(expressValidator());
app.use("/", express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(ExpressSessions({
	secret: 'dasprsecretkey',
	saveUninitialized:false,
	resave:false
}));

const db = require('./db');

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
		db.query(db.getPublications, [], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
	    	res.render('admin-publication', { title: 'Admin', publications: resp.rows});
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

app.get('/pub-edit/:uuid', function(req,res){
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

app.post('/login-request', function(req, res){
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