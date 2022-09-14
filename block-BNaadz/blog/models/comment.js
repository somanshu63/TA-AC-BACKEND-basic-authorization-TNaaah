var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    title: String,
    likes: {type: Number, default: 0},
    authorId: {type: Schema.Types.ObjectId, ref: 'User'},
    articleId: {type: Schema.Types.ObjectId, ref: 'Article'}
});

module.exports = mongoose.model('Comment', commentSchema);