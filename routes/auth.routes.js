const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { authError } = require("../error-handling/authError");
const upload = require("../middleware/multer.middlware");


const { isAuthenticated } = require("./../middleware/jwt.middleware");

const router = express.Router();
const saltRounds = 10;

let responseSent = false; //Allow us to stop  the code in different promesses if an error is sent

// POST /auth/signup  - Creates a new user in the database
router.post(
  "/signup",
  (req, res) => {
    const { email, password, firstName, lastName, userName } = req.body;
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

    // Check if the email, password, first name and last name are provided as an empty string
    if (
      email === "" ||
      password === "" ||
      firstName === "" ||
      firstName === ""
    ) {
      console.log("Empties fields")
      return res
        .status(400)
        .json({ message: "Provide email, password, first name and last name" });
    }

    if (!passwordRegex.test(password)) {
      console.log("Password does not respect the guidelines")
      return res.status(400).json({
        message:
          "Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.",
      });
    }

    // Check the users collection if a user with the same email already exists
    User.findOne({ email }).then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        console.log("Existing user")
        return res.status(400).json({ message: "User already exists." });
      }

      // If the email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create a new user in the database
      // We return a pending promise, which allows us to chain another `then`
      User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userName,
      }).then((createdUser) => {
        // Deconstruct the newly created user object to omit the password
        // We should never expose passwords publicly
        if (responseSent) return;
        const { email, firstName, lastName, userName, _id } = createdUser;

        // Create a new object that doesn't expose the password
        const user = { email, firstName, lastName, userName, _id };

        // Send a json response containing the user object
        res.status(201).json({ user: user });
      });
    });
  },
  authError
);

// POST  /auth / login - Verifies email and password and returns a JWT
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    console.log("Provide email and password")
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        console.log("User not found")
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email } = foundUser;
        // Create an object that will be set as the token payload
        const payload = { _id, email };

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        console.log("Invalid username or password.")
        res.status(401).json({ message: "Invalid username or password." });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Internal Server Error", err: err.message })
    );
});
// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res) => {
  // <== CREATE NEW ROUTE

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});
// GET /users/:id - Fetches one user info
router.get("/users/:id", isAuthenticated, (req, res) => {
  const userId = req.params.id;

  User.findById(userId)
    .populate("content")
    .then((user) => {
      if (!user) {
        console.log("User not found.")
        return res.status(404).json({ message: "User not found." });
      }

      const {
        email,
        firstName,
        lastName,
        userName,
        _id,
        profileImage,
        content,
      } = user;
      const userInfo = {
        email,
        firstName,
        lastName,
        userName,
        _id,
        profileImage,
        content,
      };

      res.status(200).json({ user: userInfo });
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Internal Server Error", err: err.message })
    );
});

// UPDATE USER INFO
router.put(
  "/update/:id",
  isAuthenticated,
  upload.single("profileImage"),
  async (req, res) => {
    const {
      email,
      firstName,
      lastName,
      userName,
      currentPassword,
      newPassword,
    } = req.body;
    const userId = req.payload._id;

    if (!email || !firstName || !lastName || !userName) {
      console.log("Missing fields")
      return res
        .status(400)
        .json({ message: "Please fill the missing fields" });
    }

    try {
      emailValidation(email);

      const updateData = { email, firstName, lastName, userName };

      const user = await User.findById(userId);

      if (!user) {
        console.log("User not found")
        return res.status(404).json({ message: "User not found." });
      }

      // Handle password update
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          console.log("Incorrect current password")
          return res
            .status(400)
            .json({ message: "Current password is incorrect." });
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        updateData.password = hashedPassword;
      } else if (currentPassword && !newPassword) {
        console.log("Empty new password")
        return res
          .status(400)
          .json({ message: "Please provide the new password." });
      } else if (!currentPassword && newPassword) {
        console.log("Empty old password")
        return res
          .status(400)
          .json({ message: "Please provide the old password." });
      }

      // Handle profile image update
      if (req.file) {
        updateData.profileImage = req.file.path;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });

      if (!updatedUser) {
        console.log("User not found")
        return res.status(404).json({ message: "User not found." });
      }

      const {
        email: updatedEmail,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        _id,
        userName: updatedUserName,
        profileImage,
      } = updatedUser;
      const responseUser = {
        email: updatedEmail,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        userName: updatedUserName,
        profileImage,
        _id,
      };
      res.status(200).json({ user: responseUser });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Internal Server Error", err: err.message });
    }
  }
);

module.exports = router;
