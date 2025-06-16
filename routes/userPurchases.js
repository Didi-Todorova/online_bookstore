const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

router.get('/', (req, res) => {
  res.render('userPurchases'); 
});

router.get('/purchases', async (req, res) => {
  try {
    const { email } = req.query;
    const query = {};
    
    if (email) query['customer.email'] = email;

    const purchases = await Purchase.find(query)
      .populate('book', 'title author shortDescription price totalSales')
      .sort('-purchaseDate');

    res.json(purchases);

  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases' });
  }
});

router.delete('/:id', async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        console.error('Error deleting purchase:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;