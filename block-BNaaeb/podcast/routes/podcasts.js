var express = require('express');
var router = express.Router();
var Podcast = require('../models/podcast');
const User = require('../models/user');


router.get('/', (req, res, next) => {
  var query= {};
  query.isVerified = true;
  if(req.user){
    if(req.user.membership == 'free'){
      query.section = 'free'
    }else if(req.user.membership == 'vip'){
      query = {$or: [{section: 'vip', isVerified: true}, {section: 'free', isVerified: true}]};
      
    }
  }
  Podcast.find(query, (err, podcasts) => {
    console.log(podcasts)
    if(err) return next(err);
    res.render('podcasts', {podcasts})
  });
});


/* list podcast. */
router.get('/new', function(req, res, next) {
  res.render('listPodcast');
});

//single podcast
router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  Podcast.findById(id).populate('author').exec((err, podcast) => {
    if(err) return next(err);
    res.render('singlePodcast', {podcast})
  });
});



//add podcast
router.post('/', (req, res, next) => {
   if(req.user){
     req.body.section = 'free';
     req.body.author = req.user.id;
     if(req.user.isAdmin){
       req.body.isVerified = true;
     }
   }
  console.log(req.body, req.user)
   Podcast.create(req.body, (err, podcast) => {
     if(err) return next(err);
     User.findByIdAndUpdate(podcast.author, {$push: {podcast: podcast.id}}, (err, user) => {
       if(err) return next(err);
       res.redirect('/podcasts')
     });
   });
});


//verify user's podcast
router.get('/:id/verify', (req, res, next) => {
  var id = req.params.id;
  if(req.user.isAdmin){
    Podcast.findByIdAndUpdate(id, {$set: {isVerified: true}}, (err, podcast) => {
      if(err) return next(err);
      res.redirect('/podcasts/' + id);
    });
  }else{
    req.flash('error', 'only admin can perform such operations');
    res.redirect('/users/login');
  }
  
});

//edit podcast
router.get('/:id/edit', (req, res, next) => {
  var id= req.params.id;
  if(req.user.isAdmin){
    Podcast.findById(id, (err, podcast) => {
      if(err) return next(err);
      res.render('updatePodcast', {podcast});
    });
  }else{
    req.flash('error', 'only admin can perform such operations');
    res.redirect('/users/login');
  }
});

//update podcast
router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Podcast.findByIdAndUpdate(id, req.body, (err, podcast) => {
    if(err) return next(err);
    res.redirect('/podcasts/' + id);
  }); 
});

//delete podcast
router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  if(req.user.isAdmin){
    Podcast.findByIdAndDelete(id, (err, podcast) => {
      if(err) return next(err);
      res.redirect('/podcasts');
    });
  }else{
    req.flash('error', 'only admin can perform such operations');
    res.redirect('/users/login');
  }
  
});



module.exports = router;
