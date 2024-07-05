const express = require('express');
const router = express.Router();
const Click = require('../models/Clicks.model');

router.post('/', async (req, res) => {
    const { contentId, country } = req.body;

    try {
        const click = new Click({
            content: contentId,
            country: country
        });

        await click.save();

        res.status(200).json({ message: 'Click recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:contentId', async (req, res) => {
    const { contentId } = req.params;

    try {
        const clicks = await Click.find({ content: contentId }).populate('content');
        res.status(200).json(clicks);
        console.log(clicks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
