const router = require("express").Router();
const mongoose = require("mongoose");
const Content = require("../models/Content.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");


// POST  /create
router.post("/create", isAuthenticated, (req, res) => {
    const { block, platform, url, title } = req.body;
    const userId = req.payload._id; // Extract user ID from payload
    console.log(userId)
    // Create a new entry inside the content collection
    Content.create({ block, platform, url, title, user: userId }) // Include user ID
        .then((newContent) => {

            User.findByIdAndUpdate(userId,
                { $push: { content: newContent._id } }, // Use $push to add new content ID
                { new: true, safe: true, upsert: true }) // Ensure creation if not exists, and return updated document
                .then(user => {
                    console.log('Updated user with new content:', user);
                    res.status(201).json(newContent);
                })
                .catch(err => {
                    console.error('Error updating user:', err);
                    res.status(500).json({ message: "Failed to update user with new content" });
                });

        })
        .catch((err) =>
            res.status(500).json({ message: "Failed to create content" })
        );
});

// GET /:contentId - Get content 
router.get("/:contentId", isAuthenticated, (req, res) => {
    const contentId = req.params.contentId;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
        res.status(400).json({ message: `Specified id is not valid` });
        return;
    }

    Content.findById(contentId)
        .then((content) => {
            if (!content) {
                return res.status(404).json({ message: "Content not found" });
            }
            res.json(content);
        })
        .catch(error => res.status(500).json({ message: "Error getting the content" }));
});


// PUT  /:contentID
router.put("/:contentId", isAuthenticated, (req, res) => {
    const contentId = req.params.contentId;
    const update = req.body;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
        res.status(400).json({ message: `Specified id is not valid` });
        return;
    }

    Content.findByIdAndUpdate(contentId, update, { new: true })
        .then((updatedContent) => {
            if (!updatedContent) {
                return res.status(404).json({ message: "Content not found" });
            }
            res.json(updatedContent);
        })
        .catch(error => res.status(500).json({ message: "Error updating the content" }));
});


// Delete  /:contentID
router.delete("/:contentId", isAuthenticated, (req, res) => {
    const contentId = req.params.contentId;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
        res.status(400).json({ message: `Specified id is not valid` });
        return;
    }

    Content.findByIdAndDelete(contentId)
        .then((deletedContent) => {
            if (!deletedContent) {
                return res.status(404).json({ message: "Content not found" });
            }
            res.json({ message: "Content deleted successfully" });
        })
        .catch(error => res.status(500).json({ message: "Error deleting the content" }));
});

// GET /content/:userId - Get all content created by a specific user
router.get("/users/:userId", isAuthenticated, (req, res) => {
    const userId = req.params.userId;
    console.log(userId)
    Content.find({ user: userId })
        .populate('user')
        .then((userContents) => {
            res.json(userContents);
        })
        .catch((err) =>
            res.status(500).json({ message: "Failed to retrieve user content" })
        );
});
module.exports = router;
