const express = require('express');
const router = express.Router();
const Click = require('../models/Clicks.model');

router.post('/', async (req, res) => {
    const { contentId } = req.body;

    try {
        const click = new Click({
            content: contentId
        });

        await click.save();

        res.status(200).json({ message: 'Click recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
