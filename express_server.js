const express = require("express");
const cookieParser = require('cookie-parser');
const urlDatabase = require("./data/urlDatabase");
const users = require("./data/users");
const { fetchUserByEmail, createUser, authenticateUser, fetchUserById } = require("./helpers/userHelpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const error = fetchUserByEmail(req.cookies.user_id, users)
  const whiteList = ["/", "/login", "/register"]

  if (error && !whiteList.includes(req.url)) {
    return res.redirect("/");
  }

  return next();
});

app.get("/register", (req, res) => {
  if (!fetchUserById(req.cookies.user_id, users)){
    return res.render("register");
  }
  return res.redirect("/urls")
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


app.get("/login", (req, res) => {
  if (!fetchUserById(req.cookies.user_id, users)){
    return res.render("login");
  }
  return res.redirect("/urls")
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { error, user } = authenticateUser(email, password, users);

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
  const userId = req.cookies.user_id;
  const user = fetchUserById(userId, users);
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const userId = req.cookies.user_id;
    // Check if the user_id from the cookie exists in the users database
    const user = fetchUserById(userId, users);
    if (user) { // If the user exists (meaning they are logged in)
    const templateVars = { user: user }
    // The user is logged in, render  /urls/new
    return res.render("urls_new", templateVars);
  }
  // User is not logged in, render the login page
  return res.redirect("/login")
});


app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
    // Check if the user_id from the cookie exists in the users database
    const user = fetchUserById(userId, users);
    if (user) { // If the user exists (meaning they are logged in)
  const shortURL = Math.random().toString(36).slice(2, 8);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
    }
    res.status(403).send("Restriced Area. User must be logged in")
    return;
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
  const shortURL = req.params.id;
  const longURL = urlDatabase[req.params.id];
  if (!urlDatabase[shortURL]){
    res.status(404).send(`${shortURL} does not exist`);
    return;
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening at port ${PORT}!`);
});

