var User = require('../models/user');

module.exports = {
    loggedInUser: (req, res, next) => {
        if(req.session && req.session.userId){
            next();
        }else {
            req.flash('error', 'you have to login first');
            res.redirect('/users/login');
        }
    },
    userInfo: (req, res, next) => {
        var userId = req.session && req.session.userId;
        if(userId){
            User.findById(userId, 'name membership isAdmin', (err, user) => {
                if(err) return next(err);
                req.user = user;
                res.locals.user = user;
                next();
            });
        }else{
            req.user = null;
            res.locals.user = null;
            next();
        }
    },
    
}