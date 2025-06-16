const mongoose = require('mongoose');
const Decimal128 = mongoose.Types.Decimal128;

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { 
        type: Decimal128, 
        required: true,
        get: v => v.toString(),
        set: v => Decimal128.fromString(v.toString())
    },
    image: {
      data: Buffer,
      contentType: String
    },
    shortDescription: { type: String, required: true }, 
    fullDescription: { type: String, required: true },  
    reviews: [
        {
        name: String,
        text: String
        }
    ],                      
    totalSales: { type: Number, default: 0 }        
}, { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('Book', bookSchema);