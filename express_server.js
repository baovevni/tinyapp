const express = require("express");
const cookieParser = require('cookie-parser');
const urlDatabase = require("./data/urlDatabase");
const users = require("./data/users");
const { fetchUrlsForUser, fetchUserByEmail, createUser, authenticateUser, fetchUserById } = require("./helpers/userHelpers");
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
  if (!fetchUserById(req.cookies.user_id, users)) {
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
  if (!fetchUserById(req.cookies.user_id, users)) {
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

  if (!user) {  // Handle the case where there is no user logged in.
    return res.send("Please login or register to view URLs.");
  }

  const userUrls = fetchUrlsForUser(userId, urlDatabase);

  const templateVars = {
    user: user,
    urls: userUrls
  };
  console.log('UserUrls', userUrls);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;

  const user = fetchUserById(userId, users); // Check if the user_id from the cookie exists in the users database
  if (user) {                                // If the user exists (meaning they are logged in)
    const templateVars = { user: user }

    return res.render("urls_new", templateVars); // The user is logged in, render  /urls/new
  }
  return res.redirect("/login") // User is not logged in, render the login page
});


app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;

  const user = fetchUserById(userId, users); // Check if the user_id from the cookie exists in the users database
  if (!user) {                                // If the user does not exist (not logged in)
    return res.status(403).send("Restriced Area. User must be logged in")
  }

  const shortURL = Math.random().toString(36).slice(2, 8);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: userId // Storing the ID of the user who created this URL
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); // Redirect to the page showing the new URL
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id; // Retrieve the user's ID from cookies
  const user = fetchUserById(userId, users);

  if (!userId || !user) {                                // If the user does not exist (not logged in)
    return res.status(403).send("Restriced Area. User must be logged in")
  }

  const userUrls = fetchUrlsForUser(userId, urlDatabase);
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userId !== userId) { // Check if the shortURL belongs to the user's URLs
    res.status(403).send("You don't have permission to view this URL or it Doesn't exist.");
  }

  const longURL = userUrls[shortURL];   // If the URL exists in the user's URLs, fetch longURL

  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id; // Retrieve the user's ID from cookies
  const user = fetchUserById(userId, users); // Check if the user_id from the cookie exists in the users database

  if (!userId || !user) {                                // If the user does not exist (not logged in)
    return res.status(403).send("Restriced Area. User must be logged in")
  }

  const userUrls = fetchUrlsForUser(userId, urlDatabase);
  const shortURL = req.params.id;

  if (userUrls[shortURL]) { // Check if the shortURL belongs to the user's URLs
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL; // Update URL since it belongs to the user
    res.redirect("/urls");
  } else {     // If the URL does not belong to the user, they shouldn't be allowed to edit it
    res.status(403).send("You don't have permission to edit this URL.");
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[req.params.id];
  if (!urlDatabase[shortURL]) {
    res.status(404).send(`${shortURL} does not exist`);
    return;
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.cookies.user_id; // Retrieve the user's ID from cookies
  const user = fetchUserById(userId, users); // Check if the user_id from the cookie exists in the users database

  if (!userId || !user) {                                // If the user does not exist (not logged in)
    return res.status(403).send("Restriced Area. User must be logged in")
    
  }
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userId !== userId) { // Check if the shortURL belongs to the user's URLs
    return res.status(403).send("You don't have permission to delete this URL or it Doesn't exist.");
  }
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

