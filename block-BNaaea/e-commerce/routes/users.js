var express = require('express');
const cart = require('../models/cart');
var router = express.Router();
var User = require('../models/user')
var Product = require('../models/product')


// open register form
router.get('/register', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('userRegister', {error});
});


//block user
router.get('/:id/block', (req, res, next) => {
  var id = req.params.id;
  User.findByIdAndUpdate(id, {$set: {block: true}}, (err, user) => {
    if(err) return next(err);
    res.redirect('/users/' + id);
  });
});

//unblock user
router.get('/:id/unblock', (req, res, next) => {
  var id = req.params.id;
  User.findByIdAndUpdate(id, {$set: {block: false}}, (err, user) => {
    if(err) return next(err);
    res.redirect('/users/' + id);
  });
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
      cart.create({userId: user.id}, (err, cart) => {
        if(err) return next(err);
        console.log(cart)
        req.flash('success', 'user registered successfully');
        res.redirect('/users/login');
      });
    }
  });
});

//open login form
router.get('/login', (req, res) => {
  var error = req.flash('error')[0];
  var success = req.flash('success')[0];
  res.render('userLogin', {error, success})
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
    if(user.block){
      req.flash('error', 'user is blocked');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result){
        req.flash('error', 'wrong password');
        return res.redirect('/users/login');
      }
      req.session.userId = user.id;
      console.log(req.session);
      res.redirect('/products')
    });
  });
});

//logout user
router.get('/logout', (req, res) => {
  delete req.session.userId;
  console.log(req.session)
  res.redirect('/')
});


//admin dashboard
router.get('/dashboard', (req, res, next) => {
  if(req.user.isAdmin){
    User.find({}, 'name id',  (err, users) => {
      if(err) return next(err);
      req.listOfUsers = users;
      res.locals.listOfUsers = users;
      Product.find({}, "name id", (err, products) => {
        if(err) return next(err);
        req.listOfProducts = products;
        res.locals.listOfProducts = products;
        Product.distinct('category').exec((err, categories) => {
          if(err) return next(err);
          req.listOfCategories = categories;
          res.locals.listOfCategories = categories;
          res.render('adminDashboard');
        });
      });
    });
  }else {
    req.flash('error', 'only admins can visit dashboard');
    res.redirect('/users/login');
  }
});


//single user
router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  User.findById(id, (err, user) => {
    if(err) return next(err);
    res.render('userDetails', {user});
  });
});




module.exports = router;
