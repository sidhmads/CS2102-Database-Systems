var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    app = express(),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    expressValidator = require('express-validator');


// Authentication
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var index = require('./routes/index');
var users = require('./routes/users');

// Assign Dust Engine to .dust files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

app.use(logger('dev'));

app.use(cookieParser());

// Set the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

var pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

var client = require('./db').client;

var pgPool = require('./db').pool;

app.use(session({
  store: new pgSession({
    pool : pgPool,                // Connection pool
    tableName : 'session'   // Use another table-name than the default "session" one
  }),
  secret: 'gdfhasdfnjklhvf',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);

passport.use(new LocalStrategy(
  function(username, password, done) {
   client.query('SELECT password, id FROM  public."User" WHERE nickname = $1', [username],
   (err, results, fields) => {
     if(err) {
       return done(null,false);
     };
     if(results.rows.length === 0) {
       return done(null,false);
     } else {
       const hash = results.rows[0].password;
       bcrypt.compare(password, hash, (err, response) => {
         if(response === true) {
           console.log('authenticated');
           return done(null, {user_id: results.rows[0].id});
         } else {
           return done(null, false);
         }
       });
     }
   });
}));


// app.get('/index', function(req, res) {
//   client.query('SELECT * FROM recipes', (err, result) => {
//     if(err) {
//       return console.error('error running query', err);
//     }
//     res.render('index', {recipes: result.rows});
//     // client.end()
//   });
// });
//
// app.get('/search/:name', (req,res) => {
//   client.query('SELECT * FROM recipes WHERE name = $1' , [req.params.name], (err, result) => {
//     if(err) {
//       return console.error('error running query', err);
//     }
//     if (result) {
//       res.render('index', {recipes: result.rows});
//     } else {
//       res.redirect('/');
//     }
//   });
// })
//
// app.post('/add', (req,res) => {
//   client.query('INSERT INTO recipes(name, ingredients, directions, added) VALUES($1, $2, $3, $4)',
//   [req.body.name, req.body.ingredients, req.body.directions, req.session.passport.user.user_id]);
//   res.redirect('/');
// });
//
// app.post('/edit', (req,res) => {
//   client.query('UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4',
//   [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
//   res.redirect('/');
// });
//
// app.delete('/delete/:id',(req,res) => {
//   client.query('DELETE FROM recipes WHERE id = $1',
//   [req.params.id]);
//   res.sendStatus(200);
// });

// Server

// heroku
// app.listen(process.env.PORT);

// localhost
app.listen(3000, function() {
  console.log('Server Started on Port 3000');
});
