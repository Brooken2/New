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
app.set('views', path.join(__dirname, 'views'));
app.post('/login', handleLogin);
app.post('/logout', handleLogout);

app.listen(app.get('port'), function(){
		console.log('Listening on Port: ' + app.get('port'))
});
	
	
function handleLogin(req, res){
	var result;

	console.log('made it to handleLogin');
	
	pool.query("SELECT username, password FROM users", (err, response) => {
			if (req.body.username == response.rows[0].username && req.body.password == response.rows[0].password){
				console.log('made it into the if statement');
				result = {success: true};
				req.session.user = req.body.username;
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

	
	
	
  