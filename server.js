const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ----- middleware -----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // serve HTML/CSS/JS

const USERS_DB = path.join(__dirname, "users.json");

// helper functions
function loadUsers() {
  if (!fs.existsSync(USERS_DB)) fs.writeFileSync(USERS_DB, "[]");
  return JSON.parse(fs.readFileSync(USERS_DB));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// -------- AUTH ROUTES --------

// register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send("Username and password are required");
  }

  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.send("User already exists. <a href='/login.html'>Go to Login</a>");
  }

  users.push({ username, password });
  saveUsers(users);
  console.log("User registered:", username);

  res.send("Registration successful. <a href='/login.html'>Click here to login</a>");
});

// login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.send("Invalid username or password. <a href='/login.html'>Try again</a>");
  }

  console.log("User logged in:", username);
  res.redirect("/welcome.html");
});

// -------- FILE UPLOAD --------

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// file upload route
app.post("/upload", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully!");
});

// list files
app.get("/files", (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.json([]);
    res.json(files);
  });
});

// download file
app.get("/download/:name", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.name);
  res.download(filePath);
});

// -------- root route --------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------- start server --------
const PORT = process.env.PORT || 5000; // Render assigns dynamic port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
