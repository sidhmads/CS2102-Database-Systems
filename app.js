var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    pg = require('pg'),
    app = express();

// DB Connect String
const { Pool, Client } = require('pg')
// const pool = new Pool({
//   user: 'gjnvmnraolubxm',
//   host: 'ec2-54-235-64-195.compute-1.amazonaws.com',
//   database: 'dbj8jp9pamqb64',
//   password: '84b35575558f2fe073f8ba6cc349a4e1f5295c252f83d4fe7e18a3d33c8ed4f4',
//   port: 5432,
//   ssl: 'require'
// });
const connectionString = 'postgresql://Admin:password@localhost/recipebookdb'; //for localhost
// const connectionString = 'postgresql://e0015909:group-24@psql1.comp.nus.edu.sg:5432/cs2102';
// const connectionString = 'postgres://zmoghsxduyicpd:2985714f2e86972b1368556dcc23934ea117a5b3836f05e360535df61a87937f@ec2-174-129-221-240.compute-1.amazonaws.com:5432/dbi701jafqoq2a';
const pool = new Pool({
  connectionString: connectionString,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

// var client = new pg.Client({
//     user: "zmoghsxduyicpd",
//     password: "2985714f2e86972b1368556dcc23934ea117a5b3836f05e360535df61a87937f",
//     database: "dbi701jafqoq2a",
//     port: 5432,
//     host: "ec2-174-129-221-240.compute-1.amazonaws.com",
//     ssl: 'require'
// });

const client = new Client({
  connectionString: connectionString,
})
client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
});

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

app.get('/', (req, res) => {
  res.render('homepage');
});

// app.get('/', function(req, res) {
//   client.query('SELECT * FROM recipes', (err, result) => {
//     if(err) {
//       return console.error('error running query', err);
//     }
//     res.render('index', {recipes: result.rows});
//     // client.end()
//   });
// });

app.get('/search/:name', (req,res) => {
  client.query('SELECT * FROM recipes WHERE name = $1' , [req.params.name], (err, result) => {
    if(err) {
      return console.error('error running query', err);
    }
    if (result) {
      res.render('index', {recipes: result.rows});
    } else {
      res.redirect('/');
    }
  });
})

app.post('/add', (req,res) => {
  client.query('INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)',
  [req.body.name, req.body.ingredients, req.body.directions]);
  res.redirect('/');
});

app.post('/edit', (req,res) => {
  client.query('UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4',
  [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
  res.redirect('/');
});

app.delete('/delete/:id',(req,res) => {
  client.query('DELETE FROM recipes WHERE id = $1',
  [req.params.id]);
  res.sendStatus(200);
});

// Server

// heroku
// app.listen(process.env.PORT);

// localhost
app.listen(3000, function() {
  console.log('Server Started on Port 3000');
});
