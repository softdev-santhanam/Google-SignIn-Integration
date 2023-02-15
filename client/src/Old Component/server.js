const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");
const passport = require("passport");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

app.use(
  session({
    secret: "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",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

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
const User = sequelize.define("user", {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true,
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

  // Check if the user exists in the database
  User.findOne({ where: { username } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Check if the password is correct
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!result) {
          return res
            .status(401)
            .json({ error: "Invalid username or password" });
        }

        // Login successful
        return res.status(200).json({ message: "Login successful" });
      });
    })
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

User.beforeCreate((user) => {
  if (user.password) {
    return bcrypt.hash(user.password, 10).then((hash) => {
      user.password = hash;
    });
  }
});

// Set up the Google OAuth strategy
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "1096363636723-jkjkqb0kudhr2ovvghmto1qk8e2ekeaa.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ where: { googleId: profile.id } })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            return User.create({
              password: profile.id,
              username: profile.emails[0].value,
            });
          }
        })
        .then((user) => done(null, user))
        .catch((err) => done(err));
    }
  )
);

// Set up the routes for Sign in with Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Redirect to the homepage or wherever you want to send the user after they are authenticated
    res.redirect("/");
  }
);

// Start the server
const PORT = 7000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
