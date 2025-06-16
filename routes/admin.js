const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const multer = require('multer');

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  res.render('admin'); 
});

router.post('/books', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, author, price, shortDescription, fullDescription } = req.body;
    const imageFile = req.file; 

    if (!title || !author || !price || !imageFile || !shortDescription || !fullDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const decimalPrice = new mongoose.Types.Decimal128(price.toString());

    const book = new Book({
      title,
      author,
      price: decimalPrice,
      image: {
        data: imageFile.buffer,
        contentType: imageFile.mimetype
      },
      shortDescription,
      fullDescription
    });

    await book.save();
    res.json({ message: 'Book added successfully', book });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Error adding book', error: error.message });
  }
});

router.put('/books/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, price, shortDescription, fullDescription } = req.body;

    if (!title || !author || !price || !shortDescription || !fullDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const decimalPrice = new mongoose.Types.Decimal128(price.toString());

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.title = title;
    book.author = author;
    book.price = decimalPrice;
    book.shortDescription = shortDescription;
    book.fullDescription = fullDescription;

    if (req.file) {
  book.image = {
    data: req.file.buffer,
    contentType: req.file.mimetype
  };
}

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
});

router.delete('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    await Book.findByIdAndDelete(bookId);
    const result = await Purchase.deleteMany({ book: bookId });

    res.json({
      message: 'Book and related purchases deleted successfully',
      deletedPurchases: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

router.get('/purchases', async (req, res) => {
  try {
    const { status, email } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (email) query['customer.email'] = email;

    const purchases = await Purchase.find(query)
      .populate('book', 'title author price')
      .sort('-purchaseDate');

    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases' });
  }
});

router.put('/purchases/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    purchase.status = status;
    await purchase.save();

    res.json({ message: 'Status updated successfully', purchase });
  } catch (error) {
    console.error('Error updating purchase status:', error);
    res.status(500).json({ message: 'Error updating purchase status' });
  }
});

router.post('/upload-image', upload.single('imageFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    res.json({
      path: `/images/${req.file.filename}`,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

module.exports = router;
