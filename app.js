const express = require('express');
const app = express();
const port = 3000;

app.use("/", express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);
app.set('views', './views');
app.set('view engine', 'ejs');

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.get('/', function(req, res){
	res.render('home');
})

app.get('/aboutus', function(req, res){
	res.render('about');
})

app.get('/profile/:profileId', function (req, res) {
  	res.send(req.params.profileId);
})

