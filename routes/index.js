var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport');
var client = require('.././db').client;

var bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
var loginFail = false;
router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/start');
  } else if (loginFail) {
    loginFail = false;
    return res.render('homepage', {
      errors: {msg: "Incorrect Username or Password"}
    });
  } else {
    res.render('homepage');
  }
});

router.post('/login', function(req, res, next) {
  if (req.isAuthenticated()) {return res.redirect('/start');};
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { loginFail = true; return res.redirect('/'); }
    req.login(user.user_id, function(err) {
      if (err) { return next(err); }
      return res.redirect('/start');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect('/');
});


router.post('/register', (req,res) => {
  req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
  req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
  req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
  req.checkBody("number", "Invalid phone number.").matches('^[0-9]{8}$');

  const errors = req.validationErrors();

  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('homepage', {
      errors: errors
    });
  } else {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      client.query('INSERT INTO public."User" (nickname, password, number, email) VALUES($1, $2, $3, $4)',
      [req.body.username, hash, req.body.number, req.body.email], (error, results, fields) => {
        if(error) throw error;

        client.query('SELECT id FROM public."User" ORDER BY id DESC LIMIT 1', (error, results, fields) => {
          if(error) throw error;
          const id = results.rows[0];
          req.login(id, (err) => {
            res.redirect('/start');
          });
        });
      });
    });
  }
});

router.get('/admin', authenticationAdminMiddleware(), function(req, res) {
  client.query('SELECT * FROM public."User"', (err, result) => {
    if(err) {
      return console.error('error running query', err);
    }
    res.render('admin', {users: result.rows});
  });
});

router.post('/edit', (req,res) => {
  var isAdmin = false;
  if ("isadmin" in req.body) {
    isAdmin = true;
  }
  client.query('UPDATE public."User" SET nickname=$1, isadmin=$2, email=$3, number=$4 WHERE id=$5',
  [req.body.nickname, isAdmin, req.body.email, parseInt(req.body.number), parseInt(req.body.id)], (err,results) => {
    if (err) {
      console.log(err);
    } else {
      console.log(results);
    }
  });
  res.redirect('/admin');
});

router.delete('/delete/:id', authenticationAdminMiddleware(), (req,res) => {
  client.query('DELETE FROM public."User" WHERE id = $1',
  [req.params.id]);
  res.sendStatus(200);
});

router.get('/start', authenticationMiddleware(), (req, res) => {
  res.render('startpage');
});

router.get('/profile', authenticationMiddleware(), (req, res) => {
  //querry for user details
  client.query('SELECT * FROM public."User" WHERE id = $1',
    [req.session.passport.user], (err, result) => {
      if (err) throw err;
      if(result.rows.length > 0) {
        var user_info = result.rows[0];
        client.query('SELECT name FROM public."Item" WHERE user_id = $1',
        [req.session.passport.user], (err, result) => {
          if (err) throw err;
          if(result.rows.length > 0) {
               var items_info = result.rows;
          }
           res.render('profilepage', {user: user_info, items: items_info});
        })
      } else {
        res.redirect('/start');
      }
    });
});

// test
// router.post('/placebid', (req,res) => {
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//       client.query('INSERT INTO public."User" (nickname, password, number, email) VALUES($1, $2, $3, $4)',
//       [req.body.username, hash, req.body.number, req.body.email], (error, results, fields) => {
//         if(error) throw error;

router.post('/placebid', (req,res) => {
  req.checkBody('price', 'Price must be greater than 0').matches('^[0-9]*$');
  req.checkBody('daysreq', 'Days Requested must be greater than 0').matches('^[0-9]*$');

  const errors = req.validationErrors();
  console.log('here');
  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('itempage', {
      errors: errors
    });
  } else {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      client.query('INSERT INTO public."biddingItem" (item_id, borrower_id, price_offered, days_requested, date_of_bid) VALUES($1, $2, $3, $4, $5)',
      [4, req.session.passport.user,req.body.price, req.body.daysreq, new Date()], (error, results, fields) => {
        if(error) throw error;
      });
    });
  }
});

router.get('/search/:cat', authenticationMiddleware(), (req, res) => {
  res.render('searchpage');
});

router.get('/item', authenticationMiddleware(), (req, res) => {
  res.render('itempage');
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function authenticationMiddleware () {
	return (req, res, next) => {
    // console.log('start');
		// console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
    // console.log('req');
    // console.log(req);
    // console.log(res);
	    if (req.isAuthenticated()) return next();
      else {
        res.redirect('/');
      }
	}
}

function authenticationAdminMiddleware () {
	return (req, res, next) => {
    if (req.isAuthenticated()) {
      client.query('SELECT isadmin FROM public."User" WHERE id = $1', [req.session.passport.user], (err,result) => {
        if (result.rows[0].isadmin ) return next();
        else {
          res.redirect('/');
        }
      })
    } else {
      res.redirect('/');
    }
	}
}



module.exports = router;
