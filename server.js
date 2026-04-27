const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ================= FILE DATABASE =================
const getUsers = () => {
  if (!fs.existsSync("data.json")) {
    fs.writeFileSync("data.json", "[]");
  }

  const data = fs.readFileSync("data.json");
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync("data.json", JSON.stringify(users, null, 2));
};

// ================= EMAIL SETUP =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check email config
transporter.verify((error) => {
  if (error) {
    console.log("Email config error:", error);
  } else {
    console.log("Email server ready ✅");
  }
});

// ================= API =================
app.post("/users", (req, res) => {
  const { username, email, dob } = req.body;

  const users = getUsers();

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  users.push({ username, email, dob });
  saveUsers(users);

  res.json({ message: "User saved!" });
});

app.get("/users", (req, res) => {
  const users = getUsers();
  res.json(users);
});

// ================= CRON JOB =================
cron.schedule("* * * * *", () => {
  console.log("Cron running...");

  const today = new Date();
  const month = today.getMonth();
  const date = today.getDate();

  const users = getUsers();

  users.forEach((user) => {
    const dob = new Date(user.dob);
    const todayKey = `${month}-${date}`;

    if (dob.getMonth() === month && dob.getDate() === date) {
      if (user.lastSent === todayKey) return;

      console.log("Birthday match!");

      transporter.sendMail(
        {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Happy Birthday 🎉",
          html: `
            <div style="font-family: Arial; text-align:center; padding:20px;">
              <h1 style="color:#ff6b6b;">🎉 Happy Birthday, ${user.username}! 🎉</h1>
              <p>Wishing you a wonderful day!</p>
            </div>
          `,
        },
        (err, info) => {
          if (err) {
            console.log("ERROR:", err);
          } else {
            console.log("Email sent:", info.response);

            user.lastSent = todayKey;
            saveUsers(users);
          }
        }
      );
    }
  });
});

// ================= SERVE FRONTEND =================
// ================= SERVE FRONTEND =================
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// Catch-all for React (IMPORTANT)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});