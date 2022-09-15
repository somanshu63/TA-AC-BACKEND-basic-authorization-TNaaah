var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    title: String,
    productId: {type: Schema.Types.ObjectId, ref:'Product'},
});

module.exports = mongoose.model('Comment', commentSchema); 
