var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET registeration form. */
router.get('/register', (req, res) => {
  var error = req.flash('error')[0];
  res.render('register', {error});
});

router.get('/myarticles', (req, res, next) => {
  User.findById(req.user.id).populate('articleId').exec((err, user) => {
    if(err) return next(err);
    res.render('myArticles', {user})
  });
});

//register user
router.post('/register', (req, res, next) => {
  req.body.fullName = req.body.firstName + ' ' + req.body.lastName;
  User.create(req.body, (err, user) => {
    if(err){
      req.flash('error', err.message)
      return res.redirect('/users/register')
    }
    req.flash('success', 'user registered successfully');
    res.redirect('/users/login')
  });
  
});


//get login form
router.get('/login', (req, res) => {
  var error = req.flash('error')[0];
  var success = req.flash('success')[0];
  res.render('login', {error, success});
});

//login user
router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  if(!email || !password){
    req.flash('error', 'email/password required')
    return res.redirect('/users/login');
  }
  User.findOne({email}, (err, user) => {
    if(err) return next(err);
    if(!user){
      req.flash('error', 'user dont exist')
      return res.redirect('/users/login')
    }
    user.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result){
        req.flash('error', 'password is wrong');
        return res.redirect('/users/login')
      }
      req.session.userId = user.id;
      console.log(req.session)
      User.findById(req.session.userId, (err, result) => {
        console.log(result)
      });
      req.flash('success', 'login successfull');
      res.redirect('/articles');
    });
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/articles')
});


module.exports = router;
