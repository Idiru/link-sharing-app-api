const router = require("express").Router();
const mongoose = require("mongoose");
const Content = require("../models/Content.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");


// POST  /create
router.post("/create", isAuthenticated, (req, res) => {

  const {block, platform, url} = req.body

  // Create a new entry inside the content collection
  Content.create({ block, platform, url })
    .then((newContent) => {
      res.status(201).json(newContent)
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to create content"})
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
    .catch(error => res.status(500).json({message: "Error getting the content"}));
});

// PUT  /:contentID
router.put("/:contentId", isAuthenticated, (req, res) => {
  const contentId = req.params.contentId;
  const update = req.body;

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    res.status(400).json({ message: `Specified id is not valid` });
    return;
  }

  Content.findByIdAndUpdate(contentId, update, {new: true})
    .then((updatedContent) => {
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(updatedContent);
    })
    .catch(error => res.status(500).json({message: "Error updating the content"}));
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
      res.json({message: "Content deleted successfully"});
    })
    .catch(error => res.status(500).json({message: "Error deleting the content"}));
});

module.exports = router;
