var express = require('express');
const podcast = require('../models/podcast');
var router = express.Router();
var User = require('../models/user')

//open login form
router.get('/login', (req, res) => {
  var error = req.flash('error')[0];
  var success = req.flash('success')[0];
  res.render('userLogin', {error, success})
});

//register user
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/users/register');
    }
    if(user.isAdmin){
      req.flash('success', 'admin registered successfully');
      res.redirect('/users/login');
    }else{
        req.flash('success', 'user registered successfully');
        res.redirect('/users/login');
    }
  });
});


// open register form
router.get('/register', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('userRegister', {error});
});

//login user
router.post('/login', (req, res, next) => {
  var {email, password, isAdmin} = req.body;
  if(!email || !password){
    req.flash('error', 'email/password required');
    return res.redirect('/users/login');
  }
  User.findOne({email: email}, (err, user) => {
    console.log(user)
    if(err) return next(err);
    if(!user){
      req.flash('error', 'wrong user');
      return res.redirect('/users/login');
    }
    if(!user.isAdmin){
      if(user.isAdmin !== Boolean(isAdmin)){
        req.flash('error', 'you are not admin');
        return res.redirect('/users/login');
      }
    } 
    user.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result){
        req.flash('error', 'wrong password');
        return res.redirect('/users/login');
      }
      req.session.userId = user.id;
      console.log(req.session);
      res.redirect('/podcasts')
    });
  });
});




//logout user
router.get('/logout', (req, res) => {
  delete req.session.userId;
  res.redirect('/podcasts')
});


//upgrade to vip
router.get('/:id/uptovip', (req, res, next) => {
  var id = req.params.id;
  User.findByIdAndUpdate(id, {$set: {membership: 'vip'}}, (err, user) => {
    if(err) return next(err);
    res.redirect('/users/logout');
  });
});

//upgrade to premium
router.get('/:id/uptoprm', (req, res, next) => {
  var id = req.params.id;
  User.findByIdAndUpdate(id, {$set: {membership: 'premium'}}, (err, user) => {
    if(err) return next(err);
    res.redirect('/users/logout');
  });
});





//admin dashboard
router.get('/dashboard', (req, res, next) => {
  if(req.user.isAdmin){
    User.find({}).populate('podcast').exec((err, users) => {
      if(err) return next(err);
      res.render('adminDashboard', {users});
    });
  }else {
    req.flash('error', 'only admins can visit dashboard');
    res.redirect('/users/login');
  }
});



//user details
router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  User.findById(id).populate('podcast').exec((err, user) => {
    if(err) return next(err);
    res.render('userDetails', {user})
  });
});

module.exports = router;
