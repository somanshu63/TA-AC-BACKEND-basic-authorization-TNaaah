var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref:'User'},
    products: [{type: Schema.Types.ObjectId, ref: 'Product'}]
});

module.exports = mongoose.model('Cart', cartchema); 
