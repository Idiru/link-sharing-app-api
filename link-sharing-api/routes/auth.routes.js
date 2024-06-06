const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { authError } = require("../error-handling/authError");

const { isAuthenticated } = require("./../middleware/jwt.middleware");

const router = express.Router();
const saltRounds = 10;
let responseSent = false; //Allow us to stop  the code in different promesses if an error is sent

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { email, password, firstName, lastName, userName } = req.body;

  // Check if the email, password, first name and last name are provided as an empty string
  if (email === "" || password === "" || userName === "" ) {
    return next("empty-field");
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return next("email-not-valid");
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    return next("password-format");
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email }).then((foundUser) => {
    // If the user with the same email already exists, send an error response
    if (foundUser) {
      return next("user-exists");
    }

    // If the email is unique, proceed to hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user in the database
    // We return a pending promise, which allows us to chain another `then`
    User.create({ email, password: hashedPassword, firstName, lastName, userName }).then(
      (createdUser) => {
        // Deconstruct the newly created user object to omit the password
        // We should never expose passwords publicly
        if (responseSent) return;
        const { email, firstName, lastName, userName, _id } = createdUser;

        // Create a new object that doesn't expose the password
        const user = { email, firstName, lastName, userName, _id };

        // Send a json response containing the user object
        res.status(201).json({ user: user });
      }
    );
  });

  // .catch(err => {
  //   console.log(err);
  //   return next(userAlreadyExistsError)
  //   // res.status(500).json({ message: "Internal Server Error" })
  // });
}, authError);

// POST  /auth / login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
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
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Internal Server Error", err: err.message })
    );
});
module.exports = router;
