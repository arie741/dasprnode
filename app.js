const express = require('express');
const ExpressSessions = require('express-session'); 
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fs= require('fs');
const db = require('./db');
const enc = require('./encrypt');

var pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

var pgPool = new pg.Pool({
  user: 'daspr',
  host: 'localhost',
  database: 'daspr',
  password: 'daspr2000',
  port: 5432
});  

const multer  = require('multer')
const path = require('path')
var guuid = require('uuid/v1');
const storage = multer.diskStorage({
	destination: 'views/public/uploads/',
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + guuid() + path.extname(file.originalname));
	}
});

//check file type
	
function checkFileType(file, cb){
	const fileTypes = /jpeg|jpg|png|gif/;
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = fileTypes.test(file.mimetype);
	if(mimetype && extname){
		return cb(null, true);
	} else {
		cb('Error: You can only upload images.');
	}
}

//

//uploads function

const uploadImage = multer({
	storage: storage,
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
}).single('sImage');

const uploadEventImage = multer({
	storage: storage,
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
}).single('eImage');

const uploadTimImage = multer({
	storage: storage,
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
}).single('tImage');

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

app.listen(port, function(){
	console.log(`DASPR app listening on port ${port}!`);	
});

//Helper functions
function deleteFile (fname){
	fs.unlink(fname, (err) => {
	  if (err){
	  	console.log(err);
	  }
	});
}
//

//Routes

//Clients Routes (Bahasa)
app.get('/', function(req, res, next){	
	var eventcontents = []; 
	var journalcount = 0;
	var viewscount = 0;
	db.query(db.findEvents, [], (err, resp) => {
		if (err) {
			return next(err)
		}
		var eventarr = resp.rows;
		eventcontents = eventarr.slice(0, 6);
	})		
	db.query(db.findSliderImages, [], (err, resp) => {
		if (err) {
		    return next(err)
		}
		var arr = resp.rows;
		var firstel = arr[0];
		arr.shift();
		db.query(db.addViewsCount, [], (err, resp) => {
			if (err) {
				return next(err)
			}
			db.query(db.getViewsCount, [], (err, respon) => {
			    if (err) {
			      return next(err)
			    }
			    db.query(db.countPublications, [], (err, respo) => {
				    if (err) {
				      return next(err)
				    }
				    var jarr = respo.rows;
				    journalcount = jarr[0].count;
				    res.render('home', { title: 'Home', sliderimages: arr, firstslider: firstel, newscontents: eventcontents, jc: journalcount, vc: viewscount});
			  	})  	
			    var vcarr = respon.rows;
			    viewscount = vcarr[0].count;			    
		  	})
		})	  			
  	})	
})

app.get('/aboutus', function(req, res){
	res.render('about', { title: 'Tentang Kami'});
})

app.get('/collabp', function(req, res){
	res.render('collabp', { title: 'Kolaborasi dan Mitra'});
})

app.get('/publications', function(req, res){
	res.redirect('/publications/1');
})

app.get('/publications/:page', function(req,res,next){
	var pagLength = 0;
	db.query(db.countPublications, [], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
	    var arr = resp.rows;
	    pagLength = Math.ceil(arr[0].count / 10);	
  	})
	db.query(db.getPublications, [10, ((req.params.page - 1) * 10)], (err, resp) => {
    if (err) {
      	return next(err)
    }
    	res.render('publications', { title: 'Publikasi', publications: resp.rows, pages: pagLength, currentpage: req.params.page });
	})	
})

app.post('/publication-search-request', function(req, res, next){
	var pagLength = 0;

	db.query(db.searchPublication, [req.body.pSearch], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
	    res.render('publications', { title: 'Publikasi', publications: resp.rows, pages: pagLength, currentpage: 1 });
  	})
})

app.get('/list-news-and-events', function(req, res, next){
	db.query(db.findEvents, [], (err, resp) => {
		if (err) {
			return next(err)
		}
		var arr = resp.rows[0];
		if (arr){
			var lcontent = arr.contents;
			var links = lcontent.split(",");
			res.render('list-news-and-events', {title: "News And Events", newscontents: resp.rows ,recents: resp.rows});	
		} else {
			var lcontent = [];
			res.render('list-news-and-events', {title: "News And Events", newscontents: resp.rows ,recents: resp.rows});	
		}
				
	})
})

app.get('/news-and-events/:uuid', function(req, res, next){
	db.query(db.findEvent, [req.params.uuid], (err, resp) => {
		if (err) {
			return next(err)
		}
		var arr = resp.rows[0];
		db.query(db.findEvents, [], (err, eresp) => {
			if (err) {
				return next(err)
			}
			var lcontent = arr.contents;
			var links = lcontent.split(",");
			res.render('news-and-events', { img:arr.img, etype: arr.etype ,title : arr.title, contents: arr.contents, etitle: arr.title, author:arr.author, edate:arr.edate, elinks: links[Math.floor(Math.random() * 3)] ,recents: eresp.rows});			
		})				
	})	
	
})

app.post('/ne-search-request', function(req, res, next){
	db.query(db.searchEvent, [req.body.pSearch], (err, resp) => {
		if (err) {
		  return next(err)
		}
		db.query(db.findEvents, [], (err, eresp) => {
			if (err) {
				return next(err)
			}
			var arr = resp.rows[0];
			var lcontent = "";
			var links = "";
			if (arr){
				lcontent = arr.contents;
				links = lcontent.split(",");
				res.render('list-news-and-events', {title: "News And Events", newscontents: resp.rows, recents: eresp.rows});	
			} else {
				res.render('list-news-and-events', {title: "News And Events", newscontents: resp.rows, recents: eresp.rows});	
			}
			
		})
  	})
})

app.get('/tim-kami', function(req,res,next){
	db.query(db.findTimKami, [], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
	    var arr = resp.rows;
	    arrjab= [];
	    arr.forEach(function(aj){
	    	arrjab.push(aj.jabatan);
	    });
	   	res.render('tim-kami', {title: 'Tim Kami', timkami: arr, timjabatan: arrjab});
  	})		
})

app.post('/tk-search-request', function(req,res,next){
	db.query(db.searchTimKami, [req.body.pSearch], (err, resp) => {
		if (err) {
		  return next(err)
		}
		var arr = resp.rows;
	    arrjab= [];
	    arr.forEach(function(aj){
	    	arrjab.push(aj.jabatan);
	    });
		res.render('tim-kami', { title: 'Tim Kami', timkami: resp.rows, timjabatan: arrjab});
  	})
})

app.get('/career', function(req,res,next){
	res.render('career', {title: 'Karir'})
})

//Client Routes (English)

app.get('/en/', function(req, res, next){	
	var eventcontents = []; 
	var journalcount = 0;
	var viewscount = 0;
	db.query(db.findEvents, [], (err, resp) => {
		if (err) {
			return next(err)
		}
		var eventarr = resp.rows;
		eventcontents = eventarr.slice(0, 6);
	})		
	db.query(db.findSliderImages, [], (err, resp) => {
		if (err) {
		    return next(err)
		}
		var arr = resp.rows;
		var firstel = arr[0];
		arr.shift();
		db.query(db.addViewsCount, [], (err, resp) => {
			if (err) {
				return next(err)
			}
			db.query(db.getViewsCount, [], (err, respon) => {
			    if (err) {
			      return next(err)
			    }
			    db.query(db.countPublications, [], (err, respo) => {
				    if (err) {
				      return next(err)
				    }
				    var jarr = respo.rows;
				    journalcount = jarr[0].count;
				    res.render('en-home', { title: 'Home', sliderimages: arr, firstslider: firstel, newscontents: eventcontents, jc: journalcount, vc: viewscount});
			  	})  	
			    var vcarr = respon.rows;
			    viewscount = vcarr[0].count;			    
		  	})
		})	  			
  	})	
})

app.get('/en/aboutus', function(req, res){
	res.render('en-about', { title: 'About Us'});
})

app.get('/en/collabp', function(req, res){
	res.render('en-collabp', { title: 'Collaboration & Partner'});
})

app.get('/en/publications', function(req, res){
	res.redirect('/en/publications/1');
})

app.get('/en/publications/:page', function(req,res,next){
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
    	res.render('en-publications', { title: 'Publications', publications: resp.rows, pages: pagLength, currentpage: req.params.page });
	})	
})

app.post('/en/publication-search-request', function(req, res, next){
	var pagLength = 0;

	db.query(db.searchPublication, [req.body.pSearch], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
	    res.render('en-publications', { title: 'Publications', publications: resp.rows, pages: pagLength, currentpage: 1 });
  	})
})

app.get('/en/list-news-and-events', function(req, res, next){
	db.query(db.findEvents, [], (err, resp) => {
		if (err) {
			return next(err)
		}
		var arr = resp.rows[0];
		if (arr){
			var lcontent = arr.contents;
			var links = lcontent.split(",");
			res.render('list-news-and-events', {title: "News And Events", newscontents: resp.rows ,recents: resp.rows});	
		} else {
			var lcontent = [];
			res.render('list-news-and-events', {title: "News And Events", newscontents: resp.rows ,recents: resp.rows});	
		}
			
	})
})

app.get('/en/news-and-events/:uuid', function(req, res, next){
	db.query(db.findEvent, [req.params.uuid], (err, resp) => {
		if (err) {
			return next(err)
		}
		var arr = resp.rows[0];
		db.query(db.findEvents, [], (err, eresp) => {
			if (err) {
				return next(err)
			}
			var lcontent = arr.contents;
			var links = lcontent.split(",");
			res.render('en-news-and-events', { img:arr.img, etype: arr.etype ,title : arr.title, contents: arr.encontents, etitle: arr.entitle, author:arr.author, edate:arr.edate, elinks: links[Math.floor(Math.random() * 3)] ,recents: eresp.rows});			
		})				
	})	
	
})

app.post('/en/ne-search-request', function(req, res, next){
	db.query(db.searchEvent, [req.body.pSearch], (err, resp) => {
		if (err) {
		  return next(err)
		}
		db.query(db.findEvents, [], (err, eresp) => {
			if (err) {
				return next(err)
			}
			var arr = resp.rows[0];
			var lcontent = "";
			var links = "";
			if (arr){
				lcontent = arr.contents;
				links = lcontent.split(",");
				res.render('en-list-news-and-events', {title: "List News And Events", newscontents: resp.rows, recents: eresp.rows});	
			} else {
				res.render('en-list-news-and-events', {title: "List News And Events", newscontents: resp.rows, recents: eresp.rows});	
			}
			
		})
  	})
})

app.get('/en/tim-kami', function(req,res,next){
	db.query(db.findTimKami, [], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
	    var arr = resp.rows;
	    arrjab= [];
	    arr.forEach(function(aj){
	    	arrjab.push(aj.enjabatan);
	    });
	   	res.render('en-tim-kami', {title: 'Our Team', timkami: arr, timjabatan: arrjab});
  	})		
})

app.post('/en/tk-search-request', function(req,res,next){
	db.query(db.searchTimKami, [req.body.pSearch], (err, resp) => {
		if (err) {
		  return next(err)
		}
		var arr = resp.rows;
	    arrjab= [];
	    arr.forEach(function(aj){
	    	arrjab.push(aj.enjabatan);
	    });
		res.render('en-tim-kami', { title: 'Our Team', timkami: resp.rows, timjabatan: arrjab});
  	})
})

app.get('/en/career', function(req,res,next){
	res.render('en-career', {title: 'Career'})
})

//Clients ends
//Admin Routes

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

app.get('/add-slider', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.findSliderImages, [], (err, resp) => {
			if (err) {
				return next(err)
			}
			res.render('add-slider', { title: "Manage Slider", sliderimages: resp.rows});
		})			
	} else {
		res.redirect('/admin');
	}
})

app.post('/add-slider', function (req, res, next) {
  	if(req.session.uniqueId){  		
		uploadImage(req, res, (err) => {
			if(err){
				res.render('add-slider', { ermes: err})
			} else {
				if(req.file == undefined){
					res.render('add-slider', {  title: 'Manage Slider', ermes: 'No file Selected'})
				} else {
					var uuid = require('uuid/v1');
					db.query(db.addImage, [`${req.file.filename}`, req.body.pOrder, uuid()], (err, resp) => {
				    if (err) {
				      	return next(err)
				    }
				    	db.query(db.findSliderImages, [], (err, resp) => {
							if (err) {
								return next(err)
							}
							res.render('add-slider', { title: "Manage Slider", sliderimages: resp.rows});
						})	
		  			})					
				}
			}
		});
	} else {
		res.redirect('/admin');
	}
})

app.get('/delete-slider/:fname', function(req, res, next){
	if(req.session.uniqueId){
		deleteFile('views/public/uploads/' + req.params.fname);
		db.query(db.deleteSliderImage, [req.params.fname], (err, resp) => {
			if (err) {
				return next(err);
			}
			res.redirect('/add-slider');
		})	
	} else {
		res.redirect('/admin');
	}
})

app.get('/admin-news-and-events', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.findEvents, [], (err, resp) => {
		if (err) {
			return next(err)
		}
			res.render('admin-news-and-events', { title: "Manage Events", newscontents: resp.rows});
		})
	} else {
		res.redirect('/admin');
	}
})

app.get('/add-events', function(req, res){
	if(req.session.uniqueId){
		res.render('add-events', {title: "Add News and Events"});
	} else {
		res.redirect('/admin');
	}
})

app.post('/add-events-request', function(req, res, next){
	if(req.session.uniqueId){
		uploadEventImage(req, res, (err) => {
			if(err){
				res.render('add-events', { ermes: err})
			} else {
				var now = new Date();
				var today = new Date();
				var dd = String(today.getDate()).padStart(2, '0');
				var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
				var yyyy = today.getFullYear();
				today = yyyy + '-' + mm + '-' + dd;

				if(req.file == undefined){
					res.render('add-events', { ermes: "Must add an image!"})
				} else {
					var uuid = require('uuid/v1');
					var bodyContent = req.body.eContent;
					var enBodyContent = req.body.eneContent;

					if(req.body.eType == "questionaire"){
						bodyContent = req.body.eQues1 + "," + req.body.eQues2 + "," + req.body.eQues3;
					} 

					db.query(db.addEvent, [`${req.file.filename}`, req.body.eTitle, req.body.eAuthor, now.toLocaleDateString(), bodyContent, req.body.eType, req.body.eneTitle, enBodyContent, uuid(), today], (err, resp) => {
				    	if (err) {
				    	  	return next(err)
				    	}				    
				    	res.redirect('admin-news-and-events');
		  			})					
				}
			}
		});
	} else {
		res.redirect('/admin');
	}
})

app.get('/edit-events/:uuid', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.findEvent, [req.params.uuid], (err, resp) => {
		if (err) {
			return next(err)
		}
		var arr = resp.rows[0];
		var larr = arr.contents;
		var links = larr.split(",");
		res.render('edit-events.ejs', {title: 'Edit ', econtent: arr, elinks: links})	
		})
	} else {
		res.redirect('/admin');
	}
})

app.post('/edit-events-request/:uuid', function(req, res, next){
	if(req.session.uniqueId){
		const EditEventImage = multer({
			storage: multer.diskStorage({
				destination: 'views/public/uploads/',
				filename: function(req, file, cb){
					cb(null, file.fieldname + '-' + req.params.uuid + path.extname(file.originalname));
				}
			}),
			fileFilter: function(req, file, cb){
				checkFileType(file, cb);
			}
		}).single('eImage');

		EditEventImage(req, res, (err) => {
			var bodyContent = req.body.eContent;
			var enBodyContent = req.body.eneContent;
			if(req.body.eType == "questionaire"){
				bodyContent = req.body.eQues1 + "," + req.body.eQues2 + "," + req.body.eQues3;
			}
			if(err){
				res.render('add-events', { ermes: err})
			} else {
				var now = new Date();	
				if(req.file == undefined){
					var uuid = require('uuid/v1');					 									
					db.query(db.editEvent, [req.body.eOldImg, req.body.eTitle, req.body.eAuthor, bodyContent, req.body.eType, req.body.eneTitle, enBodyContent, req.params.uuid], (err, resp) => {
					    if (err) {
					      	return next(err)
					    }
					    res.redirect('/admin-news-and-events');
		  			})
				} else {
					var uuid = require('uuid/v1');
					deleteFile("views/public/uploads/" + req.body.eOldImg);
					db.query(db.editEvent, [`${req.file.filename}`, req.body.eTitle, req.body.eAuthor, bodyContent, req.body.eType, req.body.eneTitle, enBodyContent, req.params.uuid], (err, resp) => {
				    	if (err) {
				    	  	return next(err)
				    	}				    
				    	res.redirect('/admin-news-and-events');
		  			})					
				}
			}
		});
	} else {
		res.redirect('/admin');
	}
})

app.get('/delete-event/:uuid', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.findEvent, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    var arr = resp.rows;	
			deleteFile('views/public/uploads/' + arr[0].img);
  		})
		db.query(db.deleteEvent, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.redirect('/admin-news-and-events');	
  		})
	} else {
		res.redirect('/admin');
	}
})

app.post('/admin-ne-search-request', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.searchEvent, [req.body.pSearch], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.render('admin-news-and-events', { title: 'News and Events', newscontents: resp.rows});
  		})
	} else {
		res.redirect('/admin');
	}
})

app.get('/admin-tim-kami', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.findTimKami, [], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		   	res.render('admin-tim-kami', {title:"Admin Tim Kami", timkami: resp.rows});
  		})	
	} else {
		res.redirect('/admin');
	}
})

app.get('/admin-add-tim', function(req, res, next){
	if(req.session.uniqueId){
		res.render('add-tim-kami', { title: 'Tambahkan Tim Kami'});
	} else {
		res.redirect('/admin');
	}
})

app.post('/add-tim-request', function(req, res, next){
	if(req.session.uniqueId){
		uploadTimImage(req, res, (err) => {
			if(err){
				res.render('add-tim-kami', { ermes: err})
			} else {	
				if(req.file == undefined){
					res.render('add-tim-kami', { ermes: 'Must include an image!'})
				} else {
					var uuid = require('uuid/v1');
					db.query(db.addTim, [`${req.file.filename}`, req.body.tNama, req.body.tJabatan, req.body.tKeterangan, req.body.tOverview, req.body.tRiset, req.body.tPublikasi, req.body.tSupervisi, req.body.entJabatan, req.body.entKeterangan, req.body.entOverview, req.body.entRiset, req.body.entPublikasi, req.body.entSupervisi, req.body.tFacebook, req.body.tInstagram, req.body.tTwitter, req.body.tYoutube, req.body.tUrutan, uuid()], (err, resp) => {
					    if (err) {
					      return next(err)
					    }
					    res.redirect('/admin-tim-kami');
			  		})					
				}
			}
		});
	} else {
		res.redirect('/admin');
	}
})

app.get('/edit-tim/:uuid', function(req,res,next){
	if(req.session.uniqueId){
		db.query(db.findTim, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    var arr = resp.rows;
		    res.render('edit-tim-kami', { title: 'Tim Kami', tim: arr[0]});
		})		
	} else {
		res.redirect('/admin');
	}
})

app.post('/edit-tim-request/:uuid', function(req,res,next){
	if(req.session.uniqueId){
		const EditTimImage = multer({
			storage: multer.diskStorage({
				destination: 'views/public/uploads/',
				filename: function(req, file, cb){
					cb(null, file.fieldname + '-' + req.params.uuid + path.extname(file.originalname));
				}
			}),
			fileFilter: function(req, file, cb){
				checkFileType(file, cb);
			}
		}).single('tImage');

		EditTimImage(req, res, (err) => {
			if(err){
				res.render('edit-tim-kami', { ermes: err})
			} else {
				if(req.file == undefined){								
					db.query(db.editTimKami, [req.body.tOldImg, req.body.tNama, req.body.tJabatan, req.body.tKeterangan, req.body.tOverview, req.body.tRiset, req.body.tPublikasi, req.body.tSupervisi, req.body.entJabatan, req.body.entKeterangan, req.body.entOverview, req.body.entRiset, req.body.entPublikasi, req.body.entSupervisi, req.body.tFacebook, req.body.tInstagram, req.body.tTwitter, req.body.tYoutube, req.body.tUrutan, req.params.uuid], (err, resp) => {
					    if (err) {
					      	return next(err)
					    }
					    res.redirect('/admin-tim-kami');
		  			})
				} else {
					//deleteFile("views/public/uploads/" + req.body.tOldImg);
					db.query(db.editTimKami, [`${req.file.filename}`, req.body.tNama, req.body.tJabatan, req.body.tKeterangan, req.body.tOverview, req.body.tRiset, req.body.tPublikasi, req.body.tSupervisi, req.body.entJabatan, req.body.entKeterangan, req.body.entOverview, req.body.entRiset, req.body.entPublikasi, req.body.entSupervisi, req.body.tFacebook, req.body.tInstagram, req.body.tTwitter, req.body.tYoutube, req.body.tUrutan, req.params.uuid], (err, resp) => {
				    	if (err) {
				    	  	return next(err)
				    	}				    
				    	res.redirect('/admin-tim-kami');
		  			})
				}
			}
		});
	} else {
		res.redirect('/admin');
	}
})

app.get('/delete-tim/:uuid',function(req,res,next){
	if(req.session.uniqueId){
		db.query(db.findTim, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    var arr = resp.rows;	
			deleteFile('views/public/uploads/' + arr[0].foto);
  		})
		db.query(db.deleteTim, [req.params.uuid], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.redirect('/admin-tim-kami');	
  		})
	} else {
		res.redirect('/admin');
	}
})

app.post('/admin-tk-search-request', function(req, res, next){
	if(req.session.uniqueId){
		db.query(db.searchTimKami, [req.body.pSearch], (err, resp) => {
		    if (err) {
		      return next(err)
		    }
		    res.render('admin-tim-kami', { title: 'Admin Tim Kami', timkami: resp.rows});
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
    	req.check('pwd', 'Wrong password!').equals(enc.decrypt(resp.rows[0].pwd));
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
//Admin Routes Ends