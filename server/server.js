const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "1096363636723-jkjkqb0kudhr2ovvghmto1qk8e2ekeaa.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Initialize Sequelize
const sequelize = new Sequelize("crud", "santhanakrishnan", "Askrrdc@#$sql1", {
  host: "localhost",
  dialect: "mysql",
});

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("Connected to MySQL database"))
  .catch((err) => console.error("Unable to connect to the database:", err));

// Define the User model
const User = sequelize.define("demo", {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  access_token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Sync the User model with the database
User.sync()
  .then(() => console.log("User table created"))
  .catch((err) => console.error("Error creating user table:", err));

// Get all the data
app.get("/", (req, res) => {
  User.findAll()
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// Define the API routes
app.post("/", (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);

  // Check if the user exists in the database
  User.findOne({ where: { username } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Invalid username" });
      }

      // Check if the password is correct
      if (password !== user.password) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Login successful
      return res.status(200).json({ message: "Login successful" });
    })
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

app.post("/google-login", async (req, res) => {
  const { sendToken } = req.body;
  console.log(sendToken);
  if (!sendToken) {
    return res.status(400).json({ error: "Access token is missing" });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: sendToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email } = payload;

    // check if the user already exists in your database
    const user = await User.findOne({ where: { username: email } });
    if (user) {
      console.log("User found in database");
      return res.status(200).json({ message: "Successful login with Google" });
    } else {
      // create a new user with the Google credentials
      const newUser = await User.create({
        username: email,
        access_token: sendToken,
      });
      console.log("New user created in database");
      return res.status(200).json({ message: "Successful login with Google" });
    }
  } catch (error) {
    console.error(error);
    if (error.message === "Invalid Value") {
      return res.status(400).json({ error: "Invalid access token" });
    }
    if (error.message === "user not found") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = 7000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
