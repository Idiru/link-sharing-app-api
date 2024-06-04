function authError(err, req, res, next) {
  console.log(err);

  switch (err) {
    case "user-exists":
      res.status(400).json({ message: "User already exists." });
      break;
    case "password-format":
      res
        .status(400)
        .json({
          message: "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
        });
      break;
    case "email-not-valid":
      res
        .status(400)
        .json({ message: "Provide a valid email address." });
      break;
    case "empty-field":
      res
        .status(400)
        .json({ message: "Provide email, password, first name and last name" });
      break;
    default:
      res.status("generic error...");
      break;
  }
}

module.exports = {
  authError,
};
