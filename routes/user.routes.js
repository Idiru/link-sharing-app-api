const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// GET /user/username  - Get username
router.get("/username", isAuthenticated, (req, res) => {
  const userId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: `Specified id is not valid` });
    return;
  }

  User.findById(userId)
    .select("userName")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ username: user.userName });
    })
    .catch(error => res.status(500).json(error));

});

// GET /devlinks/:username - Get user data by username
router.get('/devlinks/:userName', (req, res) => {
  const userName = req.params.userName;

  User.findOne({ userName: userName })
    .populate('content')
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    })
    .catch(error => res.status(500).json(error));
});


module.exports = router;
