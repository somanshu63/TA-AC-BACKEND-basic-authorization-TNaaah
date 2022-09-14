var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var slug = require('slug');


var articleSchema = new Schema({
    title: String,
    description: String,
    likes: {type: Number, default: 0},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    slug: {type: String, unique: true},
    authorId: {type: Schema.Types.ObjectId, ref: 'User'}
});

articleSchema.pre('save', function(next) {
    if(this.title){
        this.slug = slug(this.title);
        next();
    }else{
        next();
    }
});

module.exports = mongoose.model('Article', articleSchema);