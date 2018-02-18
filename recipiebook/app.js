var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cons = require('consolidate'),
	dust = require('dustjs-helpers'),
	pg = require('pg'),
	app = express();

//DB Connect String
var connect = "postgres://Admin:password@localhost:3000/recipiebookdb";

//Assign Dust Engine to .dust files
app.engine('dust', cons.dust);

//set default ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req, res){
	console.log('TEST');
	pg.connect(connect, function(err, client, done){
		console.log('TEST1');
		if(err){
			return console.error('fetching client from pool', err);
		}
		client.query('SELECT * FROM recipies', function(err, result){
			console.log('TEST2');
			if(err){
				return console.error('error running query', err);
			}
			res.render('index', {recipies: result.rows});
			console.log('TEST4');
			done();
		});
	});
});

//Server
app.listen(3000, function(){
	console.log('Server Started On Port 3000'); 
});