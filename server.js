var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var bcrypt = require('bcrypt');

const duration = 30 * 60 * 1000;
const active = 5 * 60 * 1000;
const saltRounds = 10;

var app = express();

const {Pool} =  require('pg');
var pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true,
	/*user: 'tuser',
	host: 'localhost',
	database: 'goaltracker',
	password: 'tpass',
	port: process.env.PORT || 5432*/
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
app.post('/createUser', handleCreateAccount);
app.post('/addnewGoals', addnewGoals);
app.get('/getGoals', getGoals);
app.get('/getUser', getUser);

app.listen(app.get('port'), function(){
		console.log('Listening on Port: ' + app.get('port'))
});
	
	
function handleLogin(req, res){
	var result;
	var username = req.body.username;
	
	pool.query("SELECT id, username, password FROM users WHERE username = $1",[username], (err, response) => {
		console.log("did we make it in the query");
		if(err){
			console.log('Error loggin in to the database');
			res.send("error");
		}
		else if(response){
			if(req.body.username == response.rows[0].username){
				bcrypt.compare(req.body.password, response.rows[0].password, function(err, goodPass){
					console.log(goodPass);
					if(goodPass == true){
						console.log(response.rows[0].id);
						result = {success: true};
						req.session.user = req.body.username;
						req.session.id = response.rows[0].id;
						res.send(result);
					}
				});
			}
			else{
					result ={success: false};
					res.send(result);
			}
		}
	});
}
 
function handleCreateAccount(req, res){
	var result;
	console.log('made it to create account');
	
	if(req.body.displayName){
		bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
			var params = [req.body.username, hash, req.body.displayName];
			pool.query("INSERT INTO users (username, password, display_name) VALUES ($1,$2, $3)", params, (err, response) => {
				if(err){
					console.log('error in our create user account');
				}
				else{
					var result = {success: true};
					req.session.user = req.body.username;
					var varia = req.body.username;
					pool.query("SELECT id FROM users WHERE username = $1", [varia], (err, response) => {
						if(err){
							console.log('error in the finding of username');
						}else{
							req.session.id = response.rows[0].id;
							res.send(result);
						}
					});
				}
			});
		});
	}
	else{
		result ={success: false}
		res.send(result);
	}
}

function handleLogout(req, res){
	var result = {success: false};

	// We should do better error checking here to make sure the parameters are present
	req.session.username = undefined;
	req.session.password = undefined;
	req.session.destroy();
	result = {success: true};
	res.send(result);
	
}


function addnewGoals(req, res){
	console.log('Add Goals');
	var userid = req.session.id;
	var username = req.session.username;
	
	var params = [req.body.goal, req.body.endDate, req.body.description, userid];
		console.log(req.body.goal, req.body.endDate, req.body.description, userid);
	
	var result = {success: false};
	
	if (req.body.goal == undefined){
		res.send("Goal Name Didnt Save");
	}
	else {
		pool.query("INSERT INTO goals(goalname, enddate, description, userid) VALUES ($1, $2, $3, $4)", params, (err) => {
			console.log("did we make it in the query");
		if(err){
			result = {success: false};
			res.send(result);
			console.error('Error executing query', err.stack);
		}
		else{
			if(req.body.goal != undefined){

				result = {success: true};
				res.send(result);
			}
			else{
				result ={success: false};
				res.send(result);
			}
		}
	});
		
		/*
		var params = [req.body.goal, req.body.endDate, req.body.description, userid];
		console.log(req.body.goal, req.body.endDate, req.body.description, userid);
		
		pool.connect(function (err, client, release) {
			
			console.log("goal name is: " + params[0]);
			
			if (err) {
				console.error('Error acquiring client', err.stack);
			}
			if(params[0] != undefined){
				console.log("goal name is: " + params[0]);
				
				pool.query("INSERT INTO goals(goalname, enddate, description, userid) VALUES ($1, $2, $3, $4)", params, function (err, response) {
					
					if (err) {
						
						result = {success: false};
						res.send(result);
						console.error('Error executing query', err.stack);
					
					}else{
						console.log('This is in my ADD GOALS');
						result = {success: true};
						
						console.log(result);
						
						res.send(result);
					}
				});
			}else{
				result = {success: false};
				res.send(result);
			}
		});	*/
	}
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

	
	
	
  