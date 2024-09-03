
function errorHandler(err, res) {
    if (!err.status || !err.message) {
      // If there is no erreur status or error message, we give a generic one
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  
    // If there is status and a mesage, we display them
    res.status(err.status).json({ message: "err.message" });
  }
  
  module.exports = errorHandler;
  