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

  // Check if admin user exists
  const existingAdmin = await Admin.findOne({ username: "admin" });
  if (existingAdmin) {
    console.log("Admin user already exists.");
    mongoose.disconnect();
    return;
  }

  // Create new admin user
  const admin = new Admin({
    username:process.env.USER_NAME,
    password:process.env.PASS_WORD,
  });

  await admin.save();
  console.log("Admin user created successfully!");
  mongoose.disconnect();
});
