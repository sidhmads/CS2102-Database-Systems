var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    pg = require('pg'),
    app = express();

// DB Connect String
const { Pool, Client } = require('pg')
const connectionString = 'postgresql://Admin:password@localhost/recipebookdb'; //for localhost
const pool = new Pool({
  connectionString: connectionString,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})
const client = new Client({
  connectionString: connectionString,
})
client.connect()


// Assign Dust Engine to .dust files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  client.query('SELECT * FROM recipes', (err, result) => {
    if(err) {
      return console.error('error running query', err);
    }
    res.render('index', {recipes: result.rows});
    // client.end()
  });
});

app.post('/add', (req,res) => {
  client.query('INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)',
  [req.body.name, req.body.ingredients, req.body.directions]);
  res.redirect('/');
});

app.delete('/delete/:id',(req,res) => {
  console.log(req.params);
  client.query('DELETE FROM recipes WHERE id = $1',
  [req.params.id]);
  res.sendStatus(200);
});

// Server
app.listen(3000, function() {
  console.log('Server Started on Port 3000');
});
