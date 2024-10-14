const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  image: {
    data: Buffer,
    contentType: String,
  },
  email: String,
  name: String,
});

module.exports = mongoose.model("User", userSchema);
