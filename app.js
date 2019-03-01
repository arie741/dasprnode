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
	res.render('admin', { title: 'Admin',  errors: req.session.errors});
	req.session.errors=null;
})

app.get('/admin-home', function(req, res){
	if(req.session.uniqueId){
		res.render('admin-home', { title: 'Admin'});
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
	req.check('pwd', 'Wrong password!').equals('pwd');
	var errors = req.validationErrors();
	if(errors){
		req.session.errors=errors;
		res.render('admin', { title: 'Admin', errors: req.session.errors});
	} else {
		req.session.uniqueId = 'admindaspr';
		res.redirect('/admin-home');
	}
})

app.get('/profile/:profileId', function (req, res) {
  	res.send(req.params.profileId);
})

