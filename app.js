const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Sample data for the news section
let newsList = [
  { id: 1, title: "Launch of New Feature", content: "We are excited to introduce a new feature for users!", date: "2024-11-25" },
  { id: 2, title: "Maintenance Update", content: "Scheduled maintenance will occur this Friday at 9 PM.", date: "2024-11-30" },
];

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
    secret: "secret_key", // Replace with a secure secret key
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

// Route to render the home page with the contact form
app.get("/home", (req, res) => {
  res.render("home", { newsList });
});

// Contact form submission route
app.post("/submit-contact", (req, res) => {
  const { name, email, message } = req.body;
  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Update this if using another service
    auth: {
      user: process.env.EMAIL, // Your email
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.TO_EMAIL, // Your email to receive messages
    subject: `Contact Form Submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending your message. Please try again later.');
    }
    console.log('Email sent successfully:', info.response);
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
    req.session.isLoggedIn = true; // Set session
    return res.redirect("/admin");
  }
  res.render("adminLogin", { error: "Invalid username or password" });
});

// Admin logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy(); // Destroy session
  res.redirect("/admin/login");
});

// Admin dashboard (protected route)
app.get("/admin", isAuthenticated, (req, res) => {
  res.render("admin", { newsList });
});

// Route to add a new news item
app.post("/admin/add-news", isAuthenticated, (req, res) => {
  const { title, content } = req.body;
  if (title && content) {
    const id = newsList.length > 0 ? newsList[newsList.length - 1].id + 1 : 1;
    const date = new Date().toISOString().split("T")[0];
    newsList.push({ id, title, content, date });
  }
  res.redirect("/admin");
});

// Route to delete a news item
app.post("/admin/delete-news", isAuthenticated, (req, res) => {
  const { id } = req.body;
  newsList = newsList.filter(news => news.id !== parseInt(id));
  res.redirect("/admin");
});

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
