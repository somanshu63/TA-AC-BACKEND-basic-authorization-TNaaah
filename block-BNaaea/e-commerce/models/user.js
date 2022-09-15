var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userschema = new Schema({
    name: String,
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 5},
    isAdmin: {type: Boolean, default: false},
    phone: Number,
    block: {type: Boolean, default: false}
});

userschema.pre('save', function(next) {
    if(this.password && this.isModified('password')){
        bcrypt.hash(this.password, 10, (err, hashed) => {
            this.password = hashed;
            next();
        });
    }else{
        next();
    }
});

userschema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    });
}


module.exports = mongoose.model('User', userschema); 