var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productschema = new Schema({
    name: String,
    quantity: Number,
    price: Number,
    image: String,
    category: String,
    likes: {type: Number, default: 0}
});

module.exports = mongoose.model('Product', productschema); 
