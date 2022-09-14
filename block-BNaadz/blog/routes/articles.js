var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var Comment = require('../models/comment');
var User = require('../models/user');
var auth = require('../middleware/auth');

/* GET articles. */
router.get('/', function(req, res) {
    Article.find({}, (err, articles) => {
        if(err) return next(err);
        res.render('articles', {articles});
    });
});

// get article form
router.get('/new', auth.loggedInUser, (req, res) => {
    res.render('articleform');
});

// get single article
router.get('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({slug: slug}).populate('authorId', 'fullName').exec((err, article) => {
        if (err) return next(err);
        Comment.find({articleId: article.id}, (err, comments) => {
            if (err) return next(err);
            res.render('singleArticle', {article, comments})
        });
    });
});


router.use(auth.loggedInUser)



//add article
router.post('/', (req, res, next) => {
    req.body.authorId = req.user._id;
    Article.create(req.body, (err, article) => {
        if (err) return next(err);
        User.findByIdAndUpdate(req.session.userId, {$push: {articleId: article.id}}, (err, user) => {
            if (err) return next(err);
            res.redirect('/articles');
        });
    });
});



//like
router.get('/:slug/like', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOneAndUpdate({slug: slug}, {$inc: {likes: 1}}, (err, article) => {
        if(err) return next(err);
        res.redirect('/articles/'+ slug);
    });
});


//dislike
router.get('/:slug/dislike', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({slug: slug}, (err, article) => {
        if(err) return next(err);
        if(article.likes > 0){
            Article.findOneAndUpdate({slug: slug}, {$inc: {likes: -1}}, (err, article) => {
                if(err) return next(err);
                res.redirect('/articles/'+ slug);
            });
        } else {
            res.redirect('/articles/'+ slug);
        }
    });
});

//open edit form
router.get('/:slug/edit', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({slug: slug}).populate('authorId', 'fullName email').exec((err, article) => {
        if(err) return next(err);
        if(article.authorId.fullName === req.user.fullName){
            res.render('articleUpdateForm', {article});
        } else {
            req.flash('error', "you cant edit someone's article")
            res.redirect('/users/login')
        }
    });
});

//update article
router.post('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOneAndUpdate({slug: slug}, (req.body), (err, article) => {
        if(err) return next(err);
        res.redirect('/articles/'+slug);
    });
});

//delete article
router.get('/:slug/delete', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOneAndDelete({slug: slug}).populate('authorId', 'fullName').exec((err, article) => {
        if (err) return next(err);
        if(article.authorId.fullName === req.user.fullName){
            res.redirect('/articles')
        } else {
            req.flash('error', "you cant delete someone's article")
            res.redirect('/users/login')
        }
        
    });
});

//add comments
router.post('/:id/comments', function(req, res, next) {
    var id = req.params.id;
    req.body.authorId = req.user.id
    req.body.articleId = id;
    Comment.create(req.body, (err, comment) => {
        if (err) return next(err);
        Article.findById(id, (err, article) => {
            if (err) return next(err);
            res.redirect('/articles/'+ article.slug)
        });
    });
});


module.exports = router;
