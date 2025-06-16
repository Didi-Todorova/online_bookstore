const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');

router.get('/:id/image', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.image || !book.image.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', book.image.contentType);
    res.send(book.image.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

router.get('/:id', (req, res) => {
  res.render('book'); 
});

router.get('/:id/data', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Error fetching book' });
  }
});

router.post('/purchases', async (req, res) => {
    try {
        const { book, customer, quantity } = req.body;

        if (!book || !customer || !quantity) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const cleanBookId = book.replace('book-', '');

        const bookData = await Book.findById(cleanBookId);
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const price = parseFloat(bookData.price);
        const totalAmount = price * quantity;

        const purchase = new Purchase({
            book: cleanBookId,
            customer,
            quantity,
            totalAmount,
            purchaseDate: new Date()
        });

        await purchase.save();

        bookData.totalSales += quantity;
        await bookData.save();

        res.status(201).json({ 
            message: 'Purchase recorded successfully',
            purchase: purchase
        });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({ 
            message: 'Error recording purchase', 
            error: error.message 
        });
    }
});

router.post('/:id/reviews', async (req, res) => {
    try {
        const { name, review } = req.body;
        const bookId = req.params.id;

        const cleanId = bookId.replace('book-', '');

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ message: 'Reviewer name is required' });
        }

        if (!review || typeof review !== 'string' || review.trim() === '') {
            return res.status(400).json({ message: 'Review text is required and must be a string' });
        }

        const book = await Book.findById(cleanId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const sanitizedName = name.trim();
        const sanitizedReview = review.trim();

        book.reviews.push({ name: sanitizedName, text: sanitizedReview });
        await book.save();

        res.json({ message: 'Review added successfully', review: sanitizedReview });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
});

module.exports = router;