const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/admin");

// Load environment variables
dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

  // Check if an admin user already exists
  const existingAdmin = await Admin.findOne({ username: process.env.USER_NAME });
  if (existingAdmin) {
    // Delete the existing admin user if found
    await Admin.deleteMany({ username: process.env.USER_NAME });
    console.log("Existing admin user deleted.");
  }

  // Create a new admin user
  const admin = new Admin({
    username: process.env.USER_NAME,
    password: process.env.PASS_WORD,
  });

  await admin.save();
  console.log("New admin user created successfully!");

  mongoose.disconnect();
});
