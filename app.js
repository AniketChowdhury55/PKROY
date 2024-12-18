const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');


dotenv.config();
const app = express();

// MongoDB Setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

// News Model
const News = require('./models/news');

// Admin credentials
const adminCredentials = {
  username: process.env.USER_NAME,
  password: process.env.PASS_WORD, // Use hashed passwords in production
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 30 }, // Session valid for 30 minutes
  })
);

// Middleware to check if admin is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/admin/login");
}


// Redirect root to home
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Home Page with News List
app.get("/home", async (req, res) => {
  try {
    const newsList = await News.find(); // Fetch news from MongoDB
    res.render("home", { newsList });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching news.");
  }
});

// Contact form submission route
app.post("/submit-contact", (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.TO_EMAIL,
    subject: `Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending your message. Please try again later.');
    }
    res.send('Thank you for contacting us! We will get back to you soon.');
  });
});

// Admin login page
app.get("/admin/login", (req, res) => {
  res.render("adminLogin", { error: null });
});

// Handle admin login
const Admin = require("./models/admin");
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.render("adminLogin", { error: "Invalid username or password" });
    }

    // Check if the password is correct
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.render("adminLogin", { error: "Invalid username or password" });
    }

    // Set session
    req.session.isLoggedIn = true;
    console.log("Admin logged in successfully.");
    res.redirect("/admin");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Server error during login.");
  }
});




// Admin logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// Admin dashboard with News List
app.get("/admin", isAuthenticated, async (req, res) => {
  try {
    const newsList = await News.find();
    res.render("admin", { newsList });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching news.");
  }
});

// Add a News Item
app.post("/admin/add-news", isAuthenticated, async (req, res) => {
  const { title, content } = req.body;

  if (title && content) {
    const newNews = new News({ title, content });

    try {
      await newNews.save(); // Save to MongoDB
      res.redirect("/admin");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding news.");
    }
  } else {
    res.redirect("/admin");
  }
});

// Delete a News Item
app.post("/admin/delete-news", isAuthenticated, async (req, res) => {
  const { id } = req.body;

  try {
    await News.findByIdAndDelete(id); // Delete from MongoDB
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting news.");
  }
});


app.post("/admin/change-password", isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const admin = await Admin.findOne({ username: "admin" }); // Assuming a single admin user
    if (!admin) {
      return res.status(404).send("Admin not found.");
    }

    // Validate the current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.send("Current password is incorrect.");
    }

    // Validate new password and confirmation
    if (newPassword !== confirmPassword) {
      return res.send("New password and confirm password do not match.");
    }

    // Update the password
    admin.password = newPassword; // This triggers the `pre("save")` middleware to hash it
    await admin.save();

    // Destroy session and log out
    req.session.destroy(() => {
      console.log("Session destroyed. Password updated.");
      res.send("Password updated successfully. Please log in again.");
    });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).send("Error updating password. Please try again.");
  }
});


// 404 Page
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
});

// Start the Server
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
