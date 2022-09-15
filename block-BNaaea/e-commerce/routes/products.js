var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var User = require('../models/user')
var Comment = require('../models/comment')
var auth = require('../middlewares/auth')

//get products
router.get('/', (req, res, next) => {
    var error = req.flash('error')[0];
    var query = {};
    var {category} = req.query;
    if(category){
        query.category = category;
    }
    Product.find(query, (err, products) => {
        if(err) return next(err);
        res.render('products', {products, error})
    });
});

//open products form
router.get('/form', auth.loggedInUser , (req, res, next) => {
    if(req.user.isAdmin){
        res.render('productsForm');
    }else{
        req.flash('error', "only admin can add products")
        res.redirect('/users/login');
    }
});

// add product
router.post('/', (req, res, next) => {
    Product.create(req.body, (err, product) => {
        if(err) return next(err);
        res.redirect('/products')
    });
});

//single product
router.get('/:id', (req, res, next) => {
    var id = req.params.id;
    var error = req.flash('error')[0];
    Product.findById(id, (err, product) => {
        if(err) return next(err);
        Comment.find({productId: product.id}, (err, comments) => {
            if(err) return next(err);
            res.render('singleProduct', {product, error, comments});
        });
    });
});

//like product
router.get('/:id/like', (req, res, next) => {
    var id = req.params.id;
    Product.findByIdAndUpdate(id, {$inc: {likes: 1}}, (err, product) => {
        if(err) return next(err);
        res.redirect('/products/' + id);
    });
});

//add comment
router.post('/:id/comment', (req, res, next) => {
    var productId = req.params.id;
    req.body.productId = productId;
    Comment.create(req.body, (err, comment) => {
        if(err) return next(err);
        res.redirect('/products/' + productId);
    });
});


//dislike product
router.get('/:id/dislike', (req, res, next) => {
    var id = req.params.id;
    if(req.session.userId){
        Product.findById(id, (err, product) => {
            if(err) return next(err);
            if(product.likes > 0){
                Product.findByIdAndUpdate(id, {$inc: {likes: -1}}, (err, product) => {
                    if(err) return next(err);
                    res.redirect('/products/' + id);
                });
            }else{
                res.redirect('/products/' + id);
            }
        });
    }
});

//edit product
router.get('/:id/edit', (req, res, next) => {
    var id = req.params.id;
    Product.findById(id, (err, product) => {
        if(err) return next(err);
        if(req.session.userId){
            User.findById(req.session.userId, (err, user) => {
              if(err) return next(err);
              res.render('productUpdateForm', {user, product});
            });
          }else{
            var user = "";
            res.render('productUpdateForm', {user, product})
          }
    });
});

//update product
router.post('/:id', (req, res, next) => {
    var id = req.params.id;
    Product.findByIdAndUpdate(id, req.body, (err, product) => {
        if(err) return next(err);
        res.redirect('/products/' + id);
    });
});

//delete product
router.get('/:id/delete', (req, res, next) => {
    var id = req.params.id;
    Product.findByIdAndDelete(id, (err, product) => {
        if(err) return next(err);
        res.redirect('/products')
    });
});


module.exports = router;
