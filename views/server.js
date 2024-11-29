const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let newsList = []; // Array to store news items

// Route for the News Section (User View)
app.get("/", (req, res) => {
  res.render("news", { newsList });
});

// Route for Admin Page (Add News)
app.get("/admin", (req, res) => {
  res.render("admin");
});

// Handle Post Request to Add News
app.post("/add-news", (req, res) => {
  const { title, content } = req.body;
  if (title && content) {
    newsList.push({ title, content, date: new Date().toLocaleString() });
  }
  res.redirect("/");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
