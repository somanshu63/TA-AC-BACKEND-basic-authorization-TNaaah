var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
    name: String,
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 5},
    isAdmin: {type: Boolean, default: false},
    membership: {type: String, default: 'free'},
    podcast: [{type: Schema.Types.ObjectId, ref: 'Podcast'}]
});


userSchema.pre('save', function(next) {
    if(this.password && this.isModified('password')){
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if(err) return next(err);
            this.password = hashed;
            next()
        });
    } else {
        next();
    }
});

userSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    });
}


module.exports = mongoose.model('User', userSchema);