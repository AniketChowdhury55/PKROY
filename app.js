const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
const app = express();

// File path for storing news data
const newsFilePath = path.join(__dirname, 'news.json');

// Function to load news data from news.json
function loadNews() {
  try {
    const data = fs.readFileSync(newsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading news file:', err);
    return [];
  }
}

// Function to save news data to news.json
function saveNews(newsList) {
  try {
    fs.writeFileSync(newsFilePath, JSON.stringify(newsList, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving news file:', err);
  }
}

// Load news on startup
let newsList = loadNews();

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
app.get("/home", (req, res) => {
  res.render("home", { newsList });
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
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === adminCredentials.username && password === adminCredentials.password) {
    req.session.isLoggedIn = true;
    return res.redirect("/admin");
  }
  res.render("adminLogin", { error: "Invalid username or password" });
});

// Admin logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// Admin dashboard with News List
app.get("/admin", isAuthenticated, (req, res) => {
  res.render("admin", { newsList });
});

// Add a News Item
app.post("/admin/add-news", isAuthenticated, (req, res) => {
  const { title, content } = req.body;

  if (title && content) {
    const newNews = {
      id: Date.now(), // Unique ID
      title,
      content,
      date: new Date().toISOString().split("T")[0],
    };

    newsList.push(newNews);
    saveNews(newsList); // Save updated news list to the file
  }
  res.redirect("/admin");
});

// Delete a News Item
app.post("/admin/delete-news", isAuthenticated, (req, res) => {
  const { id } = req.body;

  newsList = newsList.filter((news) => news.id !== parseInt(id));
  saveNews(newsList); // Save updated news list to the file
  res.redirect("/admin");
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
