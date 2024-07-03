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
router.get('/:contentId', async (req, res) => {
    const { contentId } = req.params;

    try {
        const clicks = await Click.find({ content: contentId });
        res.status(200).json(clicks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
