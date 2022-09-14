var express = require('express');
const article = require('../models/article');
var router = express.Router();
var Comment = require('../models/comment');
var auth = require('../middleware/auth')

//open update comment form
router.get('/:id/edit', (req, res, next) => {
    var id = req.params.id;
    Comment.findById(id).populate('authorId', 'fullName').exec((err, comment) => {
        if(err) return next(err);
        if(comment.authorId.fullName === req.user.fullName){
            res.render('commentUpdateForm', {comment})
        }else {
            req.flash('error', "you can't edit someone's comment ")
            res.redirect('/users/login')
        }
        
    });
});

//update comment
router.post('/:id', (req, res, next) => {
    var id = req.params.id;
    Comment.findByIdAndUpdate(id, req.body, (err, comment) => {
        if(err) return next(err);
        article.findById(comment.articleId, (err, article) => {
            if(err) return next(err);
            res.redirect('/articles/' + article.slug)
        });
    });
});

router.use(auth.loggedInUser)


//like
router.get('/:id/like', (req, res, next) => {
    var id = req.params.id;
    Comment.findByIdAndUpdate(id, {$inc: {likes: 1}}, (err, comment) => {
        if(err) return next(err);
        article.findById(comment.articleId, (err, article) => {
            if(err) return next(err);
            res.redirect('/articles/' + article.slug)
        });
    });
});


//dislike
router.get('/:id/dislike', (req, res, next) => {
    var id = req.params.id;
    Comment.findById(id, (err, comment) => {
        if(err) return next(err);
        if(comment.likes > 0){
            Comment.findByIdAndUpdate(id, {$inc: {likes: -1}}, (err, comment) => {
                if(err) return next(err);
                article.findById(comment.articleId, (err, article) => {
                    if(err) return next(err);
                    res.redirect('/articles/' + article.slug)
                });
            });
        }else {
            article.findById(comment.articleId, (err, article) => {
                if(err) return next(err);
                res.redirect('/articles/' + article.slug)
            });
        }
    });
});


router.get('/:id/delete', (req, res, next) => {
    var id = req.params.id;
    Comment.findById(id).populate('authorId', 'fullName').exec((err, comment) => {
        if(err) return next(err);
        if(comment.authorId.fullName === req.user.fullName){
            Comment.findByIdAndDelete(id, (err, comment) => {
                if(err) return next(err);
                res.redirect('/articles')
            });
        }else {
            req.flash('error', "you can't delete someone's comment ")
            res.redirect('/users/login')
        }
        
    });
});

module.exports = router;
