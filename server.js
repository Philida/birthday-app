const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ================= MONGODB =================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected ✅"))
.catch((err) => console.log("MongoDB error ❌", err));

// ================= MODEL =================
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  dob: String,
  lastSent: String,
});

const User = mongoose.model("User", userSchema);

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

transporter.verify((error) => {
  if (error) {
    console.log("Email config error:", error);
  } else {
    console.log("Email server ready ✅");
  }
});

// ================= API =================

// CREATE USER
app.post("/users", async (req, res) => {
  try {
    const { username, email, dob } = req.body;

    if (!username || !email || !dob) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await User.create({ username, email, dob });

    return res.json({ message: "User saved!" });
  } catch (err) {
    return res.status(500).json({ message: "Error saving user" });
  }
});

// GET USERS
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE USER
app.put("/users/:id", async (req, res) => {
  try {
    const { username, email, dob } = req.body;

    await User.findByIdAndUpdate(
      req.params.id,
      { username, email, dob },
      { new: true }
    );

    return res.json({ message: "User updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE USER
app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ================= CRON JOB =================
cron.schedule("0 0 * * *", async () => {
  console.log("Cron running...");

  const today = new Date();
  const month = today.getMonth();
  const date = today.getDate();

  const users = await User.find();

  for (let user of users) {
    const dob = new Date(user.dob);
    const todayKey = `${month}-${date}`;

    if (dob.getMonth() === month && dob.getDate() === date) {
      if (user.lastSent === todayKey) continue;

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
        async (err, info) => {
          if (err) {
            console.log("ERROR:", err);
          } else {
            console.log("Email sent:", info.response);
            user.lastSent = todayKey;
            await user.save();
          }
        }
      );
    }
  }
});

// ================= SERVE FRONTEND =================
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});