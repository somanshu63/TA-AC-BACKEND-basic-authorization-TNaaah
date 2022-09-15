var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var podcastSchema = new Schema({
    name: String,
    image: String,
    date: Date,
    time: String,
    section: String,
    audio: String,
    isVerified: { type: Boolean, default: false},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
});



module.exports = mongoose.model('Podcast', podcastSchema);