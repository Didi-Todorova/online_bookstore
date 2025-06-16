const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const path = require('path');
const multer = require('multer');

router.get('/', function(req, res, next) {
  res.render('index');
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

module.exports = router;
