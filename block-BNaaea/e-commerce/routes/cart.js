var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var User = require('../models/user');
var auth = require('../middlewares/auth');

router.use(auth.loggedInUser);




//add data to cart
router.get('/:productId/add', (req, res, next) => {
    var productId = req.params.productId;
    var userId = req.user.id;
    Cart.findOne({userId: userId}, (err, cart) => {
        if(err) return next(err);
        if(cart.products.includes(productId)){
            req.flash('error', 'already added');
            return res.redirect('/products');
        }else {
            Cart.findOneAndUpdate({userId: userId}, {$push: {products: productId}}, (err, cart) => {
                if(err) return next(err);
                res.redirect('/products');
            });
        }
    });
});

//get cart
router.get('/', (req, res, next) => {
    Cart.findOne({userId: req.user.id}).populate('products').exec((err, cart) => {
    if(err) return next(err);
    console.log(cart)
    res.render('cart', {cart})
    });
});


//remove item from cart
router.get('/:id/remove', (req, res, next) => {
    var userId = req.user.id;
    var productId = req.params.id;
    Cart.findOneAndUpdate({userId: userId}, {$pull: {products: productId}}, (err, cart) => {
        if(err) return next(err);
        res.redirect('/cart');
    });
});



module.exports = router;
