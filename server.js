const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ----- middleware -----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form POST
app.use(express.static("public"));

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
  // (no sessions for simplicity) redirect to welcome page
  res.redirect("/welcome.html");
});

// -------- FILE UPLOAD ROUTES --------

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// multer storage
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// upload API
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "ishitakhandagale@gmail.com" && password === "12345") {
        res.redirect('/welcome.html');
    } else {
        res.send("Invalid login details");
    }
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

// ------------------------

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
