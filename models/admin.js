const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
});


// Method to compare passwords
// Method to compare passwords (no bcrypt used)
adminSchema.methods.comparePassword = function (candidatePassword) {
  return candidatePassword === this.password;
};


const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
