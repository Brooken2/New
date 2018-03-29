var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');

const duration = 30 * 60 * 1000;
const active = 5 * 60 * 1000;
const saltRounds = 10;

var app = express();

const {Pool} =  require('pg');
var pool = new Pool({
	/*connectionString: process.env.DATABASE_URL,
	ssl: true,*/
  user: 'tuser',
  host: 'localhost',
  database: 'goaltracker',
  password: 'tpass',
  port: process.env.PORT || 5432
});



var logRequest = function (req, res, next){
	console.log("Received a request from " + req.url);
	next();
}

var verifyLogin = function (req, res, next) {
	if (typeof req.session.user != "undefined"){
		next();
	}
}


app.set('port', (process.env.PORT || 5000));
app.use(session({cookieName: 'session', secret: 'user-session', duration: duration, activeDuration: active,}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.post('/login', handleLogin);
app.post('/logout', handleLogout);
app.get('/getGoals', getGoals);
app.get('/addGoals', addGoals);
app.get('/getUser', getUser);
app.get('/homePage', homeGoals);

app.listen(app.get('port'), function(){
		console.log('Listening on Port: ' + app.get('port'))
});
	
	
function handleLogin(req, res){
	var result;

	console.log('made it to handleLogin');
	
	pool.query("SELECT id, username, password FROM users", (err, response) => {
			if (req.body.username == response.rows[0].username && req.body.password == response.rows[0].password){
				console.log(response.rows[0].id);
				result = {success: true};
				req.session.user = req.body.username;
				req.session.id = response.rows[0].id;
				//res.redirect('/homePage');
				res.send(result);
			}
			else{
				result ={success: false};
				res.send(result);
			}
	});
}

function handleLogout(req, res){
	var result = {success: false};

	// We should do better error checking here to make sure the parameters are present
	if (req.session.user) {
		req.session.destroy();
		result = {success: true};
		res.send(result);
	}
	
}


function homeGoals(req, res){
	console.log('home page has been called');
	res.send('homePage.html');
}


function addGoals(req, res){
	console.log('Add Goals');
	var userid = req.session.id;
	var name = req.query.gname;
	var endDate = req.query.endDate;
	var des = req.query.desciption;
	//console.log(name + endDate + des + userid);
		
	pool.connect(function (err, client, release) {
  		if (err) {
  				return console.error('Error acquiring client', err.stack);
		}
 		client.query("INSERT INTO goals(goalname, enddate, description, userid) VALUES ('"+ name + "', '" + endDate + "', '"  + des +"', '" +userid  + "')"  , function (err, result) {
    				client.release();
    				if (err) {
      				return console.error('Error executing query', err.stack);
    				}
			//res.json(result.rows);
			res.redirect('/homePage');
  		});
	});	
}

function getUser(req, res){
	console.log('Users have been called');
	if(req.session.user){
		var id = req.session.id;	
		console.log('requested id: ' + id);
	
		getGoals(id, function(err, result){	
			res.json(result);
		});
	}
	else{
		console.log('redirect to login page');
	}
}

function getGoals(id, callback){
	console.log('GET GOALS is CALLED  WITH id: ' + id);
	var value = id;
	pool.query("SELECT * FROM goals WHERE userid=$1",[value], function(err, res){
		if(err){
			throw err;
		}
		else {
			console.log('back from DB with: ' +  JSON.stringify(res.rows));
			var results = JSON.stringify(res.rows);
			callback(null, results);
		}
	});
}

	
	
	
  