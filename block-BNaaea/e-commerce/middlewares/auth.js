const user = require("../models/user");
var Product = require('../models/product')

module.exports = {
    loggedInUser: (req, res, next) => {
        if(req.session && req.session.userId){
            next();
        }else {
            req.flash('error', "you have to login first");
            res.redirect('/users/login');
        }
    },
    userInfo: (req, res, next) => {
        var userId = req.session && req.session.userId;
        if(userId){
            user.findById(userId, 'name isAdmin block', (err, user) => {
                if(err) return next(err);
                req.user = user;
                res.locals.user = user;
                next();
            });
        }else {
            req.user = null;
            res.locals.user = null;
            next();
        }
    },
    categories: (req, res, next) => {
        Product.distinct('category').exec((err, result) => {
            if(err) return next(err);
            req.categories = result;
            res.locals.categories = result;
            next();
        });
    }
}