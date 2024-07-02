const express = require('express');
const router = express.Router();
const Click = require('../models/Clicks.model');

// Route to handle a click event
router.post('/', async (req, res) => {
    const { contentId, userId } = req.body;

    try {
        const click = new Click({
            content: contentId,
            user: userId // userId is optional
        });
        await click.save();

        res.status(200).json({ message: 'Click recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
