const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

purchaseSchema.pre('save', async function(next) {
    const book = await mongoose.model('Book').findById(this.book);
    if (book) {
        const price = parseFloat(book.price);
        this.totalAmount = price * this.quantity;
    }
    next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);