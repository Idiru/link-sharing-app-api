const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { authError } = require("../error-handling/authError");

const { isAuthenticated } = require("./../middleware/jwt.middleware");

const router = express.Router();
const saltRounds = 10;
let responseSent = false; //Allow us to stop  the code in different promesses if an error is sent

const emailValidation = (email) => {
  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return next("email-not-valid");
  }
}
const passwordValidation = (password) => {
  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    return next("password-format");
  }
}
// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { email, password, firstName, lastName, userName } = req.body;

  // Check if the email, password, first name and last name are provided as an empty string
  if (email === "" || password === "" || firstName === "" || firstName === "") {
    return next("empty-field");
  }


  emailValidation(email)


  passwordValidation(password)

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
router.get('/verify', isAuthenticated, (req, res, next) => {       // <== CREATE NEW ROUTE

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});
// GET /users/:id - Fetches one user info
router.get("/users/:id", isAuthenticated, (req, res, next) => {
  const userId = req.params.id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const { email, firstName, lastName, userName, _id } = user;
      const userInfo = { email, firstName, lastName, userName, _id };

      res.status(200).json({ user: userInfo });
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error", err: err.message }));
});

// UPDATE USER INFO 
router.put('/update/:id', isAuthenticated, async (req, res) => {
  const { email, firstName, lastName, userName, currentPassword, newPassword } = req.body;
  const userId = req.payload._id;

  if (!email || !firstName || !lastName || !userName) {
    return res.status(400).json({ message: "Please fill the missing fields" });
  }


  try {
    emailValidation(email);

    const updateData = { email, firstName, lastName, userName };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If passwords are provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }

      passwordValidation(newPassword);
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateData.password = hashedPassword;
    }
    else if (currentPassword && !newPassword) {
      return res.status(400).json({ message: "please provide the new password." });

    }
    else if (!currentPassword && newPassword) {
      return res.status(400).json({ message: "please provide the old password." });

    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const { email: updatedEmail, firstName: updatedFirstName, lastName: updatedLastName, _id, userName: updatedUserName } = updatedUser;
    const responseUser = { email: updatedEmail, firstName: updatedFirstName, lastName: updatedLastName, userName: updatedUserName, _id };
    res.status(200).json({ user: responseUser });

  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

module.exports = router;