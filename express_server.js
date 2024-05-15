const express = require("express");
const cookieParser = require('cookie-parser');
const urlDatabase = require("./data/urlDatabase");
const users = require("./data/users");
const { fetchUserByEmail, createUser, authenticateUser } = require("./helpers/userHelpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send('Email or password cannot be empty');
  }

  // Attempt to create a user
  const newUser = createUser(email, password, users);

  if (!newUser) {
    // means user already exists or there was an error
    return res.status(400).send('Email already exists');
  }

  // Assuming the user is successfully created
  res.cookie('user_id', newUser.id);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email } = req.body;
  console.log('email is', email);
  const { error, user } = authenticateUser(email, users);

  if (error) {
    console.log(error);
    return res.status(403).send(error);
  } 

  res.cookie("user_id", user.id);  
  return res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] || null;
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] || null;

  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // this will log POST request to the console
  const shortURL = Math.random().toString(36).slice(2, 8);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404).send(`${id} does not exist`);
    return;
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(users);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening at port ${PORT}!`);
});

