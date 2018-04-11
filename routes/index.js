var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport');
var client = require('.././db').client;

var user_id;

var bcrypt = require('bcrypt');
const saltRounds = 10;

var results_added = {};
var x = 0;

var transacted = [];

setInterval(function () {
  client.query('WITH ex AS (SELECT A.item_id, (B.price_offered * B.days_requested) AS earnings, B.borrower_id, B.date_of_bid FROM public.item AS A NATURAL JOIN public."biddingItem" AS B WHERE not_expired = FALSE and self_selection = FALSE ORDER BY A.item_id, earnings DESC, date_of_bid ASC)  ,bid AS (SELECT item_id, MAX(earnings) as earnings FROM ex GROUP BY item_id ) ,winning_bid AS (SELECT A.item_id, A.earnings, B.date_of_bid, B.days_requested FROM bid AS A INNER JOIN  public."biddingItem" AS B ON A.item_id = B.item_id AND A.earnings = (B.price_offered * B.days_requested))  , winners AS (SELECT item_id as id, MAX(earnings) AS earnings, MIN(date_of_bid) AS date_of_bid ,MAX(days_requested) AS days_requested FROM winning_bid GROUP BY item_id) select id, earnings, B.days_requested, borrower_id, A.date_of_bid from winners as A INNER JOIN  public."biddingItem" AS B ON A.id = B.item_id AND A.earnings = (B.price_offered * B.days_requested) AND A.date_of_bid = B.date_of_bid')
  .then(
  result => {
    results_added = result.rows;
  });
}, 2000);

// setInterval(function() {
//   client.query('SELECT item_id as id, borrower_id, days_requested, (days_requested * price_offered) as earnings, date_of_bid FROM public."biddingItem" WHERE selected = True')
//   .then(
//   result => {
//     results_added = result.rows;
//   });
// }, 200);

setInterval(() => {
  if (results_added.length > 0 ){
    var ids = [];
    for (var i of results_added) {
      var endDate = new Date()
      endDate.setDate(endDate.getDate() + parseInt(i.days_requested));
      var id = i.id;
      ids.push(id);
      var borrower_id = i.borrower_id;
      var earnings = i.earnings;
      if (!(i in transacted)) {
        client.query('INSERT INTO public.transaction (item_id, borrower_id, start_date, end_date, earnings) VALUES ($1, $2, $3, $4, $5)', [id, borrower_id, new Date(), endDate, earnings] );
        transacted.push(i);
        console.log(i);
      }
    }
    for (var i of ids) {
      client.query('DELETE FROM public."biddingItem" WHERE item_id = $1',
      [i]);
      client.query('UPDATE public.item SET not_expired = FALSE, borrowed=TRUE WHERE item_id = $1', [i]);
    }
    results_added = {};
    ids = [];
}
}, 100);

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

//ADMIN PAGE
router.get('/admin', authenticationAdminMiddleware(), function(req, res) {
  client.query('SELECT * FROM public."User"', (err, result) => {
    if(err) {
      return console.error('error running query', err);
    }
    res.render('admin', {users: result.rows});
  });
});

//ADMIN PAGE
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

//ADMIN PAGE
router.delete('/delete/:id', authenticationAdminMiddleware(), (req,res) => {
  client.query('DELETE FROM public."User" WHERE id = $1',
  [req.params.id]);
  res.sendStatus(200);
});

//START PAGE
router.get('/start', authenticationMiddleware(), (req, res) => {
  user_id = req.session.passport.user.id | req.session.passport.user
  console.log(user_id);
  client.query('SELECT isadmin FROM public."User" WHERE id = $1', [user_id], (err, result) => {
    res.render('startpage', {user: result.rows[0]});
  });
});


//PROFILE PAGE
router.get('/profile', authenticationMiddleware(), (req, res) => {
  //querry for user details
  client.query('SELECT * FROM public."User" WHERE id = $1',
    [user_id], (err, result) => {
      if (err) throw err;
      if(result.rows.length > 0) {
        var user_info = result.rows[0];
        var selling_items_info, bidding_items_info, self_selected_items_info, borrowed, lent;
        var updated = false;
        //get items being sold by user
        client.query('SELECT * FROM public.item WHERE user_id = $1',
        [user_id], (err, result) => {
          if (err) throw err;
          if(result.rows.length > 0) {
               selling_items_info = result.rows;//list
               for (var i of selling_items_info) {
                 if(i['not_expired'] === false) {
                   i['expired'] = true;
                 } else {
                   i['expired'] = false;
                 }
                 if(i['self_selection'] === false) {
                   i['self_selection'] = 'auto'
                 } else {
                   i['self_selection'] = 'self'
                 }
               }
               updated = true;
          }
          // get items being bidded by user
          client.query('SELECT item_name, price_offered, days_requested, date_of_bid, (SELECT nickname FROM public."User" WHERE id = I.user_id), bid_item_id, min_price, lend_duration FROM public."biddingItem" B INNER JOIN public.item I on (B.item_id =I.item_id) WHERE borrower_id = $1',
          [user_id], (err, result) => {
            if (err) throw err;
            if(result.rows.length > 0) {
                 bidding_items_info = result.rows;//list
                 // console.log(bidding_items_info);
            }

          });
          client.query('SELECT A.bid_item_id, C.item_id, C.item_name, B.nickname, A.price_offered, A.days_requested, (A.price_offered * A.days_requested) AS earnings FROM public."biddingItem" AS A INNER JOIN public."User" AS B ON A.borrower_id = B.id INNER JOIN public.item AS C ON A.item_id = C.item_id WHERE C.self_selection = TRUE AND C.user_id = $1 ORDER BY C.item_name DESC, earnings DESC'
        ,[user_id] , (err, result) => {
          self_selected_items_info = result.rows;
        });

        client.query('SELECT B.item_name, C.nickname, C.number, A.start_date, A.end_date, A.earnings FROM public.transaction AS A INNER JOIN public.item AS B ON A.item_id = B.item_id INNER JOIN public."User" AS C ON B.user_id = C.id WHERE A.borrower_id = $1', [user_id], (err, result) => {
          if(result.rows.length > 0) {
            borrowed = result.rows;
          }
        });
        client.query('SELECT B.item_name, C.nickname, C.number, A.start_date, A.end_date, A.earnings FROM public.transaction AS A INNER JOIN public.item AS B ON A.item_id = B.item_id INNER JOIN public."User" AS C ON A.borrower_id = C.id WHERE B.user_id = $1', [user_id], (err, result) => {
          if(result.rows.length > 0) {
            lent = result.rows;
          }
          res.render('profilepage', {user: user_info, items: selling_items_info, bidding_items: bidding_items_info, manual_select: self_selected_items_info, transaction_lend: lent, transaction_borrow: borrowed});
        });
             });
      } else {
        res.redirect('/start');
      }
    });
});


//PROFILE PAGE
router.post('/addItem', authenticationMiddleware(), (req, res) => {
  if (req.body.min_price === '') {
    req.body.min_price = 0;
  }
  if (req.body.bid_duration === '') {
    req.body.bid_duration = 3;
  }
  if (req.body.lend_duration === '') {
    req.body.lend_duration = 21;
  }
  client.query('INSERT INTO public.item (item_name, description, min_price, bid_duration, lend_duration, category, user_id, date_of_creation, bid_start_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8)',
    [req.body.item_name, req.body.description, req.body.min_price, req.body.bid_duration, req.body.lend_duration, req.body.category, user_id, new Date()]);
    res.redirect('/profile');
});

//PROFILE PAGE
router.post('/editItem', authenticationMiddleware(), (req, res) => {
  console.log(req.body);
  var bid_start_today;
  var self_selection;
  if (req.body.minPrice === '') {
    req.body.minPrice = 0;
  }
  if (req.body.bidDura === '') {
    req.body.bidDura = 3;
  }
  if (req.body.lendDura === '') {
    req.body.lendDura = 21;
  }
  if (req.body.bid_winner === 'self') {
    self_selection = true;
  } else {
    self_selection = false;
  }
  console.log(self_selection);
  if (req.body.bid_start_today === '') {
    client.query('UPDATE public.item SET item_name=$1, description=$2, min_price=$3, bid_duration=$4, lend_duration=$5, category=$6, self_selection=$7, not_expired = True, bid_start_date = $8 WHERE item_id=$9',
    [req.body.name, req.body.description, parseInt(req.body.minPrice), parseInt(req.body.bidDura), parseInt(req.body.lendDura), req.body.category, self_selection, new Date(), parseInt(req.body.id)], (err,results) => {
      if(err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
  } else {
    client.query('UPDATE public.item SET item_name=$1, description=$2, min_price=$3, bid_duration=$4, lend_duration=$5, category=$6, self_selection=$7, not_expired = True WHERE item_id=$8',
    [req.body.name, req.body.description, parseInt(req.body.minPrice), parseInt(req.body.bidDura), parseInt(req.body.lendDura), req.body.category, self_selection, parseInt(req.body.id)], (err,results) => {
      if(err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
  }
});

router.delete('/deleteItem/:id', authenticationMiddleware(), (req,res) => {
  client.query('DELETE FROM public.item WHERE item_id = $1',
  [req.params.id]);
  res.sendStatus(200);
});

router.get('/acceptBidder/:id', authenticationMiddleware(), (req,res) => {
  client.query('UPDATE public."biddingItem" SET selected = TRUE WHERE bid_item_id=$1',
  [req.params.id], (err, result) => {
    console.log(req.params.id);
  });
  res.redirect('/profile');
});

router.post('/editProfile', authenticationMiddleware(), (req, res) => {
  console.log(req.body);
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    client.query('UPDATE public."User" SET nickname=$1, email=$2, number = $3, password = $4 WHERE id=$5',
    [req.body.name, req.body.email, req.body.phoneno, hash, user_id], (err,results) => {
      if(err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
  });
});

router.post('/editImage', authenticationMiddleware(), (req, res) => {
  console.log(req.body);
    client.query('UPDATE public."User" SET picture=$1 WHERE id=$2',
    [(req.body.fileToUpload), user_id], (err,results) => {
      if(err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
});

router.post('/editBid', authenticationMiddleware(), (req, res) => {
  console.log(req.body);
  client.query('UPDATE public."biddingItem" SET price_offered=$1, days_requested=$2, date_of_bid = $3 WHERE bid_item_id=$4',
  [parseInt(req.body.price_offered), parseInt(req.body.days_requested), new Date(), parseInt(req.body.bid_item_id)], (err,results) => {
    if(err) {
      console.log(err);
    }
    res.redirect('/profile');
  });
});

router.delete('/deleteBid/:id', authenticationMiddleware(), (req,res) => {
  client.query('DELETE FROM public."biddingItem" WHERE bid_item_id = $1',
  [req.params.id]);
  res.sendStatus(200);
});

//ITEM PAGE
router.post('/placebid/:id', (req,res) => {
  req.checkBody('price', 'Price must be greater than 0').matches('^[0-9]*$');
  req.checkBody('daysreq', 'Days Requested must be greater than 0').matches('^[0-9]*$');
  console.log('placing bid for item id: '+ req.params.id);

  const errors = req.validationErrors();
  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('itempage', {
      errors: errors
    });
  } else {
      client.query('INSERT INTO public."biddingItem" (item_id, borrower_id, price_offered, days_requested, date_of_bid) VALUES($1, $2, $3, $4, $5)',
      [req.params.id, user_id, req.body.price, req.body.daysreq, new Date()], (error, results, fields) => {
        if (errors) {
          res.render('itempage', {
            errors: errors
          });
        } else {
          res.redirect('/item/'.concat(req.params.id));
        }
      });
  }
});



//SEARCH/RESULTS PAGE
router.get('/search/:cat', authenticationMiddleware(), (req, res) => {
  // res.render('searchpage');
  // console.log(req.params.cat);
  client.query('SELECT item_id, item_name, description, (SELECT nickname FROM public."User" WHERE id = I.user_id) FROM public.item I WHERE category = $1',
    [req.params.cat], (err, result) => {
      if (err) throw err;
      client.query('SELECT isadmin FROM public."User" WHERE id = $1', [user_id], (err, results) => {
        res.render('searchpage', {category:req.params.cat, items: result.rows, user: results.rows[0]});
        });
    });
});

//ITEM DESCRIPTION PAGE
router.get('/item/:id', authenticationMiddleware(), (req, res) => {
  //get item details
  client.query('SELECT item_id, item_name, description,min_price,bid_duration,lend_duration,category, bid_start_date, not_expired, (SELECT nickname FROM public."User" WHERE id = I.user_id), user_id FROM public.item I WHERE item_id = $1',
    [req.params.id], (err, result) => {
      if (err) throw err;
      if (result.rows.length > 0) {
        var item_details = result.rows[0];
        item_details['current_id'] = user_id;
        console.log(item_details);
        //get list of bidder details
        client.query('SELECT price_offered, bid_item_id, days_requested, date_of_bid,(SELECT nickname FROM public."User" WHERE id = B.borrower_id) FROM public."biddingItem" B WHERE item_id=$1',
          [req.params.id], (err, result) => {
              if (err) throw err;
              client.query('SELECT isadmin FROM public."User" WHERE id = $1', [user_id], (err, results) => {
                res.render('itempage', {item: item_details, borrower: result.rows, user: results.rows[0]});
                });
          });
      } else {
        res.redirect('/');
      }
    });
});

router.get('/item/expired/:id', authenticationMiddleware(), (req,res) => {
  client.query('SELECT date_of_creation, bid_duration from public.item WHERE item_id = $1', [req.params.id], (err, result) => {
    var countDownDate = new Date(result.rows[0].date_of_creation);
    countDownDate.setDate(countDownDate.getDate() + parseInt(result.rows[0].bid_duration));
    countDownDate = countDownDate.getTime();
    if (new Date().getTime() >= countDownDate) {
      client.query('UPDATE public.item SET not_expired=False WHERE item_id=$1', [req.params.id], (err,result) => {
        res.redirect('/item/'.concat(req.params.id));
      })
    } else {
      res.redirect('/item/'.concat(req.params.id));
    }
  });
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function authenticationMiddleware () {
	return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    else {
      res.redirect('/');
    }
	}
}

function authenticationAdminMiddleware () {
	return (req, res, next) => {
    if (req.isAuthenticated()) {
      client.query('SELECT isadmin FROM public."User" WHERE id = $1', [user_id], (err,result) => {
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
