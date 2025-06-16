const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

router.get('/:purchaseId', (req, res) => {
  res.render('confirmation'); 
});

router.get('/:purchaseId/data', async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.purchaseId)
            .populate('book', 'title author price');
        
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        res.json(purchase);
    } catch (error) {
        console.error('Error fetching purchase details:', error);
        res.status(500).json({ 
            message: 'Error fetching purchase details', 
            error: error.message 
        });
    }
});

module.exports = router;